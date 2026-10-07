import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, campaignId } = body;

    if (!email || !campaignId) {
      return NextResponse.json(
        { success: false, error: 'Email and campaignId are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found in database.' },
        { status: 404 }
      );
    }

    if (!user.isProfileSetup) {
      return NextResponse.json(
        { success: false, error: 'Creator profile setup is required before joining campaigns.' },
        { status: 403 }
      );
    }

    // Add campaignId if not already present
    if (!user.joinedCampaignIds.includes(campaignId)) {
      user.joinedCampaignIds.push(campaignId);
      user.updatedAt = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Joined campaign successfully.',
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
