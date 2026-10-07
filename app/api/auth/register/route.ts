import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, handle, role = 'creator' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(password);
    const cleanHandle = handle 
      ? (handle.startsWith('@') ? handle : `@${handle}`)
      : `@${normalizedEmail.split('@')[0]}`;

    let user;
    if (existing) {
      // User existed without password (e.g. from quick prompt)
      existing.passwordHash = hash;
      existing.passwordSalt = salt;
      if (name) existing.name = name;
      if (handle) existing.handle = cleanHandle;
      if (role) existing.role = role;
      await existing.save();
      user = existing;
    } else {
      user = new User({
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        handle: cleanHandle,
        avatar: role === 'brand' ? '⚡' : '🎬',
        role,
        isProfileSetup: false,
        primaryPlatform: 'x',
        socialLinks: { x: '', instagram: '', youtube: '' },
        payoutMethod: { type: 'stripe', accountIdentifier: '' },
        wallet_balance: role === 'brand' ? 10000 : 0,
        total_earned: 0,
        total_views_generated: 0,
        joinedCampaignIds: [],
        passwordHash: hash,
        passwordSalt: salt,
      });
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
