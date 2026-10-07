import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ParticipantModel from '@/models/Participant';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, creatorId, email } = body;

    if (!campaignId || (!creatorId && !email)) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID and creator identification are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify creator profile in MongoDB if email provided
    let user = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user && !user.isProfileSetup) {
        return NextResponse.json(
          {
            success: false,
            needsSetup: true,
            error: 'Creator profile setup is required before joining campaigns.',
          },
          { status: 403 }
        );
      }
    }

    const actualCreatorId = user ? (user._id?.toString() || user.email) : creatorId;

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
      if (!user.joinedCampaignIds.includes(campaignId)) {
        user.joinedCampaignIds.push(campaignId);
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
