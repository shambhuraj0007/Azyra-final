import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import ParticipantModel from '@/models/Participant';
import CampaignModel from '@/models/Campaign';
import { INITIAL_SUBMISSIONS } from '@/lib/campaignStore';

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
    const body = await request.json();
    const { campaign_id, creator_id, video_url } = body;

    if (!campaign_id || !creator_id || !video_url) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID, creator ID, and video URL are required.' },
        { status: 400 }
      );
    }

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
    const duplicate = await SubmissionModel.findOne({ video_url: video_url.trim() });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'This video clip URL has already been submitted.' },
        { status: 409 }
      );
    }

    const newSub = new SubmissionModel({
      ...body,
      id: body.id || `sub-${Date.now()}`,
      submitted_at: Date.now(),
      last_polled_at: Date.now(),
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
