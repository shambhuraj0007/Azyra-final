import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    await connectToDatabase();

    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return NextResponse.json({ success: true, user });
      }
    }

    // Default to the most recently updated creator or null
    const latestUser = await User.findOne({ role: 'creator' }).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      user: latestUser || null,
    });
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
