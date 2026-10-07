import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('azyra_session')?.value;
    let email: string | null = null;

    if (sessionCookie) {
      const decoded = verifyToken(sessionCookie);
      if (decoded?.email) {
        email = decoded.email;
      }
    }

    if (!email) {
      // Check query param fallback
      const { searchParams } = new URL(request.url);
      email = searchParams.get('email');
    }

    if (!email) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
