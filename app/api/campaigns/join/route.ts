import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ParticipantModel from '@/models/Participant';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please sign in to join campaigns.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify creator profile in MongoDB
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found.' }, { status: 404 });
    }
    if (!user.isProfileSetup) {
      return NextResponse.json(
        {
          success: false,
          needsSetup: true,
          error: 'Creator profile setup is required before joining campaigns.',
        },
        { status: 403 }
      );
    }

    const actualCreatorId = user._id?.toString() || user.email;

    // Check if already joined in MongoDB
    const existing = await ParticipantModel.findOne({
      campaign_id: campaignId,
      creator_id: actualCreatorId,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        participant: existing,
      });
    }

    // Create participant record
    const newParticipant = new ParticipantModel({
      id: `part-${Date.now()}`,
      campaign_id: campaignId,
      creator_id: actualCreatorId,
      joined_at: Date.now(),
      status: 'approved',
    });
    await newParticipant.save();

    // Increment campaign participants count
    await CampaignModel.findOneAndUpdate(
      { id: campaignId },
      { $inc: { participants_count: 1 } }
    );

    // Update user's joinedCampaignIds
    if (user) {
      const currentJoined: string[] = user.joinedCampaignIds || [];
      if (!currentJoined.includes(campaignId)) {
        user.joinedCampaignIds = [...currentJoined, campaignId];
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      participant: newParticipant,
      user,
    });
  } catch (error: any) {
    console.error('Error joining campaign in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to join campaign in database.' },
      { status: 500 }
    );
  }
}
