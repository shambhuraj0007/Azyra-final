/**
 * POST /api/metrics/poll
 *
 * Background bulk poller — fetches live stats for ALL active submissions
 * that haven't been polled within the TTL window.
 *
 * Designed to be called by a cron job (e.g. every 10 minutes via Vercel Cron,
 * an external scheduler, or the admin dashboard "Poll Now" button).
 *
 * Protected by CRON_SECRET env variable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';
import { fetchLiveStats } from '@/lib/metrics';
import { calculateClipPayout } from '@/lib/campaignUtils';

/** Only re-poll if last_polled_at is older than this */
const POLL_TTL_MS = 10 * 60 * 1000; // 10 minutes for bulk poll

export async function POST(request: NextRequest) {
  try {
    // Secure the endpoint — require a shared secret header
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('x-cron-secret');

    if (cronSecret && authHeader !== cronSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const cutoff = Date.now() - POLL_TTL_MS;

    // Only poll submissions that are 'active' or 'verifying' and due for a refresh
    const staleSubs = await SubmissionModel.find({
      verification_status: { $in: ['active', 'verifying'] },
      last_polled_at: { $lt: cutoff },
    }).limit(50); // batch cap to stay within free tier quotas

    if (staleSubs.length === 0) {
      return NextResponse.json({ success: true, polled: 0, message: 'All submissions are up to date.' });
    }

    let updated = 0;
    let errors = 0;
    const results: Array<{ id: string; views: number; payout: number; error?: string }> = [];

    for (const sub of staleSubs) {
      try {
        const stats = await fetchLiveStats(
          sub.platform as 'youtube_shorts' | 'x' | 'instagram',
          sub.video_external_id
        );

        const now = Date.now();

        if (stats.error) {
          // Still update timestamp so we don't hammer a failing endpoint
          await SubmissionModel.findOneAndUpdate(
            { id: sub.id },
            { $set: { last_polled_at: now } }
          );
          results.push({ id: sub.id, views: sub.current_view_count, payout: sub.earned_amount, error: stats.error });
          errors++;
          continue;
        }

        // Only update if we have new view data
        const newViews = Math.max(stats.views, sub.current_view_count);
        const viewsDelta = newViews - sub.current_view_count;

        const campaign = await CampaignModel.findOne({ id: sub.campaign_id });
        if (!campaign) {
          results.push({ id: sub.id, views: newViews, payout: sub.earned_amount, error: 'Campaign not found' });
          continue;
        }

        const { payout } = calculateClipPayout({
          initialViews: sub.initial_view_count,
          currentViews: newViews,
          cpmRate: campaign.cpm_rate,
          maxPayoutPerClip: campaign.max_payout_per_clip,
          minViewsThreshold: campaign.min_views_threshold,
          campaignRemainingBudget: campaign.remaining_budget + sub.earned_amount,
        });

        const payoutDelta = payout - sub.earned_amount;

        // Update submission
        await SubmissionModel.findOneAndUpdate(
          { id: sub.id },
          {
            $set: {
              current_view_count: newViews,
              earned_amount: payout,
              last_polled_at: now,
            },
          }
        );

        // Update campaign totals if something changed
        if (payoutDelta > 0 || viewsDelta > 0) {
          const newRemainingBudget = Math.max(0, campaign.remaining_budget - payoutDelta);
          await CampaignModel.findOneAndUpdate(
            { id: sub.campaign_id },
            {
              $inc: {
                remaining_budget: -payoutDelta,
                total_views_tracked: viewsDelta,
                total_paid_out: payoutDelta,
              },
              ...(newRemainingBudget <= 0 ? { $set: { status: 'budget_exhausted' } } : {}),
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

        results.push({ id: sub.id, views: newViews, payout });
        updated++;
      } catch (subErr: any) {
        errors++;
        results.push({ id: sub.id, views: sub.current_view_count, payout: sub.earned_amount, error: subErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      polled: staleSubs.length,
      updated,
      errors,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[metrics/poll POST]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Poll failed' },
      { status: 500 }
    );
  }
}
