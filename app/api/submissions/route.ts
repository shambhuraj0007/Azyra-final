import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import ParticipantModel from '@/models/Participant';
import CampaignModel from '@/models/Campaign';
import { INITIAL_SUBMISSIONS } from '@/lib/campaignStore';
import { auth } from '@/auth';

export async function GET() {
  try {
    await connectToDatabase();

    let submissions = await SubmissionModel.find({}).sort({ submitted_at: -1 }).lean();

    if (!submissions || submissions.length === 0) {
      await SubmissionModel.insertMany(INITIAL_SUBMISSIONS);
      submissions = await SubmissionModel.find({}).sort({ submitted_at: -1 }).lean();
    }

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error: any) {
    console.error('Error fetching submissions from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error fetching submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please sign in to submit a clip.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaign_id, video_url, platform, video_external_id } = body;

    if (!campaign_id || !video_url) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and video URL are required.' },
        { status: 400 }
      );
    }

    const creator_id = (session.user as any).id || session.user.email;

    await connectToDatabase();

    // Access Control Check 1: Campaign must exist and be active
    const campaign = await CampaignModel.findOne({ id: campaign_id });
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found.' },
        { status: 404 }
      );
    }
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { success: false, error: `This campaign is currently ${campaign.status}. Submissions are closed.` },
        { status: 403 }
      );
    }

    // Access Control Check 2: Creator must be enrolled in the campaign
    const isEnrolled = await ParticipantModel.findOne({
      campaign_id,
      creator_id,
    });

    if (!isEnrolled) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You must join this campaign before submitting video clips.' },
        { status: 403 }
      );
    }

    // Access Control Check 3: Prevent duplicate link submissions
    const cleanUrl = typeof video_url === 'string' ? video_url.trim() : '';
    const duplicate = await SubmissionModel.findOne({ video_url: cleanUrl });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'This video clip URL has already been submitted.' },
        { status: 409 }
      );
    }

    // Explicitly whitelist fields — do NOT spread uncontrolled body (Mass-Assignment protection)
    const newSub = new SubmissionModel({
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      campaign_id,
      creator_id,
      creator_name: session.user.name || 'Creator',
      creator_handle: (session.user as any).handle || `@${session.user.email?.split('@')[0]}`,
      video_url: cleanUrl,
      platform: platform || 'youtube_shorts',
      video_external_id: video_external_id || '',
      submitted_at: Date.now(),
      last_polled_at: Date.now(),
      views_count: 0,
      likes_count: 0,
      payable_amount: 0,
      verification_status: 'verifying',
      payout_status: 'pending',
    });

    await newSub.save();

    return NextResponse.json({
      success: true,
      submission: newSub,
    });
  } catch (error: any) {
    console.error('Error saving submission in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save submission' },
      { status: 500 }
    );
  }
}
