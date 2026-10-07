import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, additionalViews, payoutDelta, newEarnedPayout, newCurrentViews, status } = body;

    await connectToDatabase();

    const sub = await SubmissionModel.findOne({ id: submissionId });
    if (!sub) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    sub.current_view_count = newCurrentViews;
    sub.earned_amount = newEarnedPayout;
    if (status) sub.verification_status = status;
    sub.last_polled_at = Date.now();
    await sub.save();

    // Update campaign budget in MongoDB
    if (payoutDelta) {
      await CampaignModel.findOneAndUpdate(
        { id: sub.campaign_id },
        {
          $inc: {
            remaining_budget: -payoutDelta,
            total_views_tracked: additionalViews,
            total_paid_out: payoutDelta,
          },
        }
      );
    }

    // Update creator wallet in MongoDB
    if (sub.creator_id) {
      await User.findOneAndUpdate(
        { $or: [{ id: sub.creator_id }, { email: sub.creator_id }] },
        {
          $inc: {
            wallet_balance: payoutDelta,
            total_earned: payoutDelta,
            total_views_generated: additionalViews,
          },
        }
      );
    }

    return NextResponse.json({ success: true, submission: sub });
  } catch (error: any) {
    console.error('Error updating simulation in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update simulation' },
      { status: 500 }
    );
  }
}
