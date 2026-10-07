import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ParticipantModel from '@/models/Participant';
import { INITIAL_PARTICIPANTS } from '@/lib/campaignStore';

export async function GET() {
  try {
    await connectToDatabase();

    let participants = await ParticipantModel.find({}).lean();

    if (!participants || participants.length === 0) {
      await ParticipantModel.insertMany(INITIAL_PARTICIPANTS);
      participants = await ParticipantModel.find({}).lean();
    }

    return NextResponse.json({
      success: true,
      participants,
    });
  } catch (error: any) {
    console.error('Error fetching participants from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error fetching participants' },
      { status: 500 }
    );
  }
}
