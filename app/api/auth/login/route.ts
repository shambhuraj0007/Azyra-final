import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email. Please sign up.' },
        { status: 404 }
      );
    }

    // If user has a password set, verify it
    if (user.passwordHash && user.passwordSalt) {
      if (!password) {
        return NextResponse.json(
          { success: false, error: 'Password is required to sign in.' },
          { status: 400 }
        );
      }
      const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid password. Please check your credentials.' },
          { status: 401 }
        );
      }
    } else if (password) {
      // First time setting a password for an existing account
      const { hash, salt } = hashPassword(password);
      user.passwordHash = hash;
      user.passwordSalt = salt;
      await user.save();
    }

    const token = generateToken({
      email: user.email,
      role: user.role,
      id: user._id.toString(),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        isProfileSetup: user.isProfileSetup,
        primaryPlatform: user.primaryPlatform,
        socialLinks: user.socialLinks,
        payoutMethod: user.payoutMethod,
        wallet_balance: user.wallet_balance,
        total_earned: user.total_earned,
        total_views_generated: user.total_views_generated,
        joinedCampaignIds: user.joinedCampaignIds,
        isLoggedIn: true,
      },
    });

    response.cookies.set('azyra_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
