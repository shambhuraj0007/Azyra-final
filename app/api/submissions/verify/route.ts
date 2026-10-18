import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import CampaignModel from '@/models/Campaign';
import UserModel from '@/models/User';
import { auth } from '@/auth';
import { calculateClipPayout } from '@/lib/campaignUtils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please sign in to verify submissions.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      submissionId,
      action,
      verifiedViews,
      approvedPayout,
      rejectionReason,
      notes,
    } = body;

    if (!submissionId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid submissionId and action (approve/reject) are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const sub = await SubmissionModel.findOne({ id: submissionId });
    if (!sub) {
      return NextResponse.json(
        { success: false, error: 'Submission not found.' },
        { status: 404 }
      );
    }

    const campaign = await CampaignModel.findOne({ id: sub.campaign_id });
    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Associated campaign not found.' },
        { status: 404 }
      );
    }

    // Authorization: Only the campaign creator / sponsor / brand or admin can verify submissions
    const userEmail = session.user.email.toLowerCase();
    const userId = (session.user as any).id;
    const isCampaignOwner =
      campaign.brand_id === userId ||
      campaign.brand_id === userEmail ||
      campaign.brand_name.toLowerCase() === (session.user.name || '').toLowerCase() ||
      (session.user as any).role === 'brand' ||
      (session.user as any).role === 'admin';

    if (!isCampaignOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Only the sponsor who created this campaign can review and verify submissions.',
        },
        { status: 403 }
      );
    }

    const now = Date.now();
    const reviewerName = session.user.name || session.user.email;

    // ── ACTION: REJECT ───────────────────────────────────────────────────────
    if (action === 'reject') {
      sub.verification_status = 'rejected';
      sub.rejection_reason = rejectionReason || notes || 'Submission did not meet campaign requirements.';
      sub.reviewed_at = now;
      sub.reviewed_by = reviewerName;
      await sub.save();

      return NextResponse.json({
        success: true,
        message: 'Submission rejected. No escrow funds were deducted.',
        submission: sub,
      });
    }

    // ── ACTION: APPROVE ──────────────────────────────────────────────────────
    let finalViews = typeof verifiedViews === 'number' && verifiedViews >= 0
      ? verifiedViews
      : sub.current_view_count;

    let finalPayout: number;

    if (typeof approvedPayout === 'number' && approvedPayout >= 0) {
      // Sponsor explicitly set a custom payout amount
      finalPayout = Math.min(approvedPayout, campaign.remaining_budget + sub.earned_amount);
    } else {
      // Calculate automatically using campaign CPM/bounty model
      const { payout } = calculateClipPayout({
        initialViews: sub.initial_view_count,
        currentViews: finalViews,
        cpmRate: campaign.cpm_rate,
        maxPayoutPerClip: campaign.max_payout_per_clip,
        minViewsThreshold: campaign.min_views_threshold,
        campaignRemainingBudget: campaign.remaining_budget + sub.earned_amount,
      });
      finalPayout = payout;
    }

    const FEE_PERCENT = 0.07; // 7% platform fee when paying to creators
    const payoutDelta = Number((finalPayout - sub.earned_amount).toFixed(2));
    const platformFeeDelta = Number((payoutDelta * FEE_PERCENT).toFixed(2));
    const netCreatorCredit = Number((payoutDelta - platformFeeDelta).toFixed(2));
    const viewsDelta = Math.max(0, finalViews - sub.current_view_count);

    if (payoutDelta > campaign.remaining_budget) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient escrow budget remaining ($${campaign.remaining_budget.toFixed(2)}) for this payout ($${payoutDelta.toFixed(2)}).`,
        },
        { status: 400 }
      );
    }

    const totalPlatformFee = Number((finalPayout * FEE_PERCENT).toFixed(2));
    const totalNetPayout = Number((finalPayout - totalPlatformFee).toFixed(2));

    // 1. Update submission record
    sub.verification_status = 'approved';
    sub.current_view_count = finalViews;
    sub.earned_amount = finalPayout;
    sub.platform_fee = totalPlatformFee;
    sub.net_payout = totalNetPayout;
    sub.proof_notes = notes || sub.proof_notes;
    sub.reviewed_at = now;
    sub.reviewed_by = reviewerName;
    sub.rejection_reason = undefined;
    await sub.save();

    // 2. Deduct payout delta from campaign escrow
    if (payoutDelta > 0 || viewsDelta > 0) {
      const newRemainingBudget = Math.max(0, campaign.remaining_budget - payoutDelta);
      await CampaignModel.findOneAndUpdate(
        { id: sub.campaign_id },
        {
          $inc: {
            remaining_budget: -payoutDelta,
            total_paid_out: payoutDelta,
            total_views_tracked: viewsDelta,
          },
          ...(newRemainingBudget <= 0 ? { $set: { status: 'budget_exhausted' } } : {}),
        }
      );

      // 3. Credit creator's wallet balance with net payout (after 7% platform fee)
      await UserModel.findOneAndUpdate(
        { $or: [{ id: sub.creator_id }, { email: sub.creator_id }] },
        {
          $inc: {
            wallet_balance: netCreatorCredit,
            total_earned: netCreatorCredit,
            total_views_generated: viewsDelta,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Submission verified! $${finalPayout.toFixed(2)} bounty approved ($${netCreatorCredit.toFixed(2)} net disbursed to creator after 7% platform fee of $${platformFeeDelta.toFixed(2)}).`,
      submission: sub,
      payoutDelta,
      platformFeeDelta,
      netCreatorCredit,
    });
  } catch (error: any) {
    console.error('[Verify Submission] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify submission.' },
      { status: 500 }
    );
  }
}
