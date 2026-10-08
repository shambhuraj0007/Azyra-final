import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const existing = await User.findOne({ email: normalizedEmail }).select('+password +passwordHash');

    if (existing && (existing.password || existing.passwordHash)) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);
    // Legacy hash for backwards compatibility
    const { hash, salt } = hashPassword(password);

    const cleanHandle = handle
      ? (handle.startsWith('@') ? handle : `@${handle}`)
      : `@${normalizedEmail.split('@')[0]}`;

    let user;
    if (existing) {
      existing.password = hashedPassword;
      existing.passwordHash = hash;
      existing.passwordSalt = salt;
      if (name) existing.name = name;
      if (handle) existing.handle = cleanHandle;
      if (role) existing.role = role === 'brand' ? 'brand' : 'creator';
      existing.isProfileSetup = false;
      existing.updatedAt = new Date();
      await existing.save();
      user = existing;
    } else {
      user = new User({
        email: normalizedEmail,
        password: hashedPassword,
        passwordHash: hash,
        passwordSalt: salt,
        name: name || normalizedEmail.split('@')[0],
        handle: cleanHandle,
        avatar: role === 'brand' ? '⚡' : '🎬',
        role: role === 'brand' ? 'brand' : 'creator',
        isProfileSetup: false,
        creatorStatus: 'none',
        wallet_balance: role === 'brand' ? 10000 : 0,
        total_earned: 0,
        total_views_generated: 0,
        joinedCampaignIds: [],
      });
      await user.save();
    }

    // Set cookie token for legacy readers if needed
    const token = generateToken({
      email: user.email,
      role: user.role,
      id: user._id.toString(),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
        isProfileSetup: Boolean(user.isProfileSetup),
        creatorStatus: user.creatorStatus,
        wallet_balance: user.wallet_balance,
        total_earned: user.total_earned,
        total_views_generated: user.total_views_generated,
        joinedCampaignIds: user.joinedCampaignIds || [],
        isLoggedIn: true,
      },
    });

    response.cookies.set('whop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}
