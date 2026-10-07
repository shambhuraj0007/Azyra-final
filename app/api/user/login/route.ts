import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required to login.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user with profile setup pending
      user = new User({
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        handle: `@${normalizedEmail.split('@')[0]}`,
        avatar: '🎬',
        role: 'creator',
        isProfileSetup: false,
        primaryPlatform: 'x',
        socialLinks: { x: '', instagram: '', youtube: '' },
        payoutMethod: { type: 'stripe', accountIdentifier: '' },
        wallet_balance: 0,
        total_earned: 0,
        total_views_generated: 0,
        joinedCampaignIds: [],
      });
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error logging in user to MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
