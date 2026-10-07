import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      handle,
      bio,
      avatar,
      primaryPlatform,
      socialLinks,
      payoutMethod,
      role = 'creator',
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required to setup profile.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '';

    // Find and update or create new user
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = new User({
        email: normalizedEmail,
        name: name || '',
        handle: normalizedHandle,
        avatar: avatar || '🎬',
        bio: bio || '',
        role,
        isProfileSetup: true,
        primaryPlatform: primaryPlatform || 'x',
        socialLinks: {
          x: socialLinks?.x || '',
          instagram: socialLinks?.instagram || '',
          youtube: socialLinks?.youtube || '',
        },
        payoutMethod: {
          type: payoutMethod?.type || 'stripe',
          accountIdentifier: payoutMethod?.accountIdentifier || '',
        },
        wallet_balance: 0,
        total_earned: 0,
        total_views_generated: 0,
        joinedCampaignIds: [],
      });
      await user.save();
    } else {
      user.name = name ?? user.name;
      user.handle = normalizedHandle || user.handle;
      user.avatar = avatar || user.avatar;
      user.bio = bio ?? user.bio;
      user.role = role || user.role;
      user.isProfileSetup = true;
      user.primaryPlatform = primaryPlatform || user.primaryPlatform;
      user.socialLinks = {
        x: socialLinks?.x ?? user.socialLinks.x,
        instagram: socialLinks?.instagram ?? user.socialLinks.instagram,
        youtube: socialLinks?.youtube ?? user.socialLinks.youtube,
      };
      if (payoutMethod) {
        user.payoutMethod = {
          type: payoutMethod.type || user.payoutMethod?.type || 'stripe',
          accountIdentifier: payoutMethod.accountIdentifier ?? user.payoutMethod?.accountIdentifier ?? '',
        };
      }
      user.updatedAt = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Profile setup successfully saved to database.',
      user,
    });
  } catch (error: any) {
    console.error('Error saving user profile to MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save profile in database.' },
      { status: 500 }
    );
  }
}
