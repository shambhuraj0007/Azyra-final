import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const handle = searchParams.get('handle');

    await connectToDatabase();

    // 1. Caller requesting their own full profile
    if (session?.user?.email && (!email || email.toLowerCase() === session.user.email.toLowerCase())) {
      const currentUser = await User.findOne({ email: session.user.email.toLowerCase() }).lean();
      if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user: currentUser });
    }

    // 2. Public profile lookup by handle or specific email (STRICTLY sanitized, zero sensitive PII)
    const query = handle
      ? { handle: handle.startsWith('@') ? handle : `@${handle}` }
      : email
      ? { email: email.toLowerCase() }
      : null;

    if (!query) {
      return NextResponse.json({ success: false, error: 'Handle or authentication required' }, { status: 400 });
    }

    const publicUser = await User.findOne(query)
      .select('name handle avatar image role isProfileSetup creatorStatus bio profile.displayName profile.bio profile.niches profile.links')
      .lean();

    if (!publicUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: publicUser });
  } catch (error: any) {
    console.error('Error fetching user from database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database error occurred',
      },
      { status: 500 }
    );
  }
}
