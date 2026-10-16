import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email and password must be valid strings.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password +passwordHash +passwordSalt');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    let isValid = false;
    if (user.password) {
      const bcrypt = (await import('bcryptjs')).default;
      isValid = await bcrypt.compare(password, user.password);
    } else if (user.passwordHash && user.passwordSalt) {
      isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    } else {
      // Account created via Google OAuth with no password set
      return NextResponse.json(
        { success: false, error: 'This account was created via Google OAuth. Please use "Sign in with Google".' },
        { status: 400 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
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
