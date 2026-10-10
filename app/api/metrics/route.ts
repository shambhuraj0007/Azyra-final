/**
 * GET /api/metrics?submissionId=<id>
 *
 * Fetches live stats for a single submission from the real platform API.
 * Returns cached data from DB if last_polled_at is within the TTL window.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';
import { fetchLiveStats } from '@/lib/metrics';
import { calculateClipPayout } from '@/lib/campaignUtils';

/** Cache TTL: don't re-fetch the platform if polled within this window */
const POLL_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: 'submissionId is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const sub = await SubmissionModel.findOne({ id: submissionId });
    if (!sub) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    const now = Date.now();
    const timeSinceLastPoll = now - (sub.last_polled_at || 0);

    // Return cached data if TTL hasn't expired
    if (timeSinceLastPoll < POLL_TTL_MS) {
      return NextResponse.json({
        success: true,
        submission: sub,
        fromCache: true,
        nextPollIn: Math.ceil((POLL_TTL_MS - timeSinceLastPoll) / 1000),
      });
    }

    // Fetch live stats from the platform
    const stats = await fetchLiveStats(
      sub.platform as 'youtube_shorts' | 'x' | 'instagram',
      sub.video_external_id
    );

    // If we got real view data, recalculate payout
    let updatedSub = sub;
    if (!stats.error && stats.views > sub.current_view_count) {
      const campaign = await CampaignModel.findOne({ id: sub.campaign_id });

      if (campaign) {
        const { payout } = calculateClipPayout({
          initialViews: sub.initial_view_count,
          currentViews: stats.views,
          cpmRate: campaign.cpm_rate,
          maxPayoutPerClip: campaign.max_payout_per_clip,
          minViewsThreshold: campaign.min_views_threshold,
          campaignRemainingBudget: campaign.remaining_budget + sub.earned_amount,
        });

        const payoutDelta = payout - sub.earned_amount;
        const viewsDelta = stats.views - sub.current_view_count;

        // Update submission in DB
        sub.current_view_count = stats.views;
        sub.earned_amount = payout;
        sub.last_polled_at = now;
        await sub.save();

        // Update campaign totals
        if (payoutDelta > 0 || viewsDelta > 0) {
          await CampaignModel.findOneAndUpdate(
            { id: sub.campaign_id },
            {
              $inc: {
                remaining_budget: -payoutDelta,
                total_views_tracked: viewsDelta,
                total_paid_out: payoutDelta,
              },
            }
          );

          // Update creator wallet
          await User.findOneAndUpdate(
            { $or: [{ id: sub.creator_id }, { email: sub.creator_id }] },
            {
              $inc: {
                wallet_balance: payoutDelta,
                total_earned: payoutDelta,
                total_views_generated: viewsDelta,
              },
            }
          );
        }

        updatedSub = sub;
      }
    } else {
      // Just update the polled timestamp even if no change
      await SubmissionModel.findOneAndUpdate(
        { id: submissionId },
        { $set: { last_polled_at: now } }
      );
    }

    return NextResponse.json({
      success: true,
      submission: updatedSub,
      liveStats: stats,
      fromCache: false,
    });
  } catch (error: any) {
    console.error('[metrics GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
