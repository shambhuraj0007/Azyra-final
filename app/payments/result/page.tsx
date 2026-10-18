'use client';

/**
 * app/payments/result/page.tsx
 * Landing page after Dodo Payments redirects back. Polls server for final status.
 * NOTE: Wrapped in <Suspense> for Next.js static prerendering compatibility.
 */
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Crown,
  ShieldCheck,
  Wallet,
  ExternalLink,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type ResultState = 'checking' | 'paid' | 'failed' | 'pending';

interface PaymentStatusResponse {
  success: boolean;
  status: 'PENDING' | 'ACTIVE' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED';
  type?: 'campaign_escrow' | 'creator_payout' | 'rank_outbid';
  amount?: number;
  redirect_url?: string | null;
  metadata?: Record<string, any> | null;
  campaign_id?: string | null;
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const typeParam = searchParams.get('type') as
    | 'campaign_escrow'
    | 'creator_payout'
    | 'rank_outbid'
    | null;
  const redirectToParam = searchParams.get('redirect_to');

  const [state, setState] = useState<ResultState>('checking');
  const [paymentData, setPaymentData] = useState<PaymentStatusResponse | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  // Poll server for payment status
  useEffect(() => {
    if (!orderId) {
      setState('failed');
      return;
    }

    let attempts = 0;
    let isCancelled = false;

    const poll = async () => {
      if (isCancelled) return;
      attempts++;

      try {
        const res = await fetch(`/api/payments/status?order_id=${encodeURIComponent(orderId)}`);
        const data: PaymentStatusResponse = await res.json();

        if (isCancelled) return;

        if (data.status === 'PAID') {
          setPaymentData(data);
          setState('paid');
        } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
          setPaymentData(data);
          setState('failed');
        } else if (attempts < 8) {
          setTimeout(poll, 2500);
        } else {
          setPaymentData(data);
          setState('pending');
        }
      } catch {
        if (!isCancelled) setState('failed');
      }
    };

    poll();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  // Determine active payment type
  const paymentType = paymentData?.type || typeParam || 'campaign_escrow';
  const amount = paymentData?.amount ?? 0;
  const metadata = paymentData?.metadata || {};

  // Compute where user left off
  const redirectDestination =
    paymentData?.redirect_url ||
    redirectToParam ||
    (paymentType === 'rank_outbid'
      ? `/?rank=${metadata?.target_rank || 1}&outbid_success=1#rank-${metadata?.target_rank || 1}`
      : paymentType === 'creator_payout'
      ? '/profile?tab=wallet&payout_success=1'
      : '/campaigns?escrow_success=1');

  // Auto-redirect timer on success
  useEffect(() => {
    if (state !== 'paid') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectDestination;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state, redirectDestination]);

  // Loading & Checking State
  if (state === 'checking') {
    return (
      <div className="w-full max-w-md rounded-3xl border border-borderMuted bg-surface p-8 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surfaceElevated border border-borderMuted">
          <Loader2 className="h-10 w-10 animate-spin text-limeAccent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-textMain">Verifying Payment...</h1>
          <p className="text-sm text-textMuted leading-relaxed">
            Please wait while we confirm your transaction with Dodo Payments gateway.
          </p>
          {orderId && <p className="text-[11px] font-mono text-textMuted">Order Ref: {orderId}</p>}
        </div>
      </div>
    );
  }

  // Failed / Expired State
  if (state === 'failed' || state === 'pending') {
    const isFailed = state === 'failed';
    return (
      <div className="w-full max-w-md rounded-3xl border border-borderMuted bg-surface p-8 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
          {isFailed ? <XCircle className="h-10 w-10" /> : <Loader2 className="h-10 w-10 animate-spin text-amber-400" />}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-textMain">
            {isFailed ? 'Payment Incomplete' : 'Payment Verification Pending'}
          </h1>
          <p className="text-sm text-textMuted leading-relaxed">
            {isFailed
              ? 'Your payment session was cancelled or could not be verified. No funds were captured.'
              : 'Your transaction is still processing on the payment rails. If you completed payment, it will reflect shortly.'}
          </p>
          {orderId && <p className="text-[11px] font-mono text-textMuted">Order Ref: {orderId}</p>}
        </div>
        <div className="flex flex-col gap-2.5">
          <a
            href={redirectDestination}
            className="w-full rounded-xl bg-surface border border-borderMuted text-textMain font-heading font-bold py-3 text-sm flex items-center justify-center gap-2 hover:bg-surfaceElevated transition"
          >
            <span>Return to Where You Left Off</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  // DISTINCT SUCCESS STATE 1: Leaderboard Rank Claim / Outbid
  if (paymentType === 'rank_outbid') {
    const targetRank = metadata?.target_rank || 1;
    const productName = metadata?.product_name || 'Your Startup';
    const productUrl = metadata?.product_url || '';

    return (
      <div className="w-full max-w-lg rounded-3xl border border-limeAccent/30 bg-surface p-6 sm:p-8 shadow-2xl shadow-limeAccent/5 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow & Badge */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-limeAccent/15 border border-limeAccent/30 text-limeAccent shadow-xl shadow-limeAccent/15 animate-bounce">
          <Crown className="h-10 w-10 fill-limeAccent/20 text-limeAccent" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-limeAccent bg-limeAccent/10 border border-limeAccent/30">
            <Flame className="h-3.5 w-3.5" />
            <span>Leaderboard Rank #{targetRank} Claimed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-textMain">
            Spot #{targetRank} Successfully Secured!
          </h1>
          <p className="text-sm text-textMuted max-w-sm mx-auto">
            <strong className="text-white">{productName}</strong> has displaced the prior holder and is now prominently locked on the leaderboard.
          </p>
        </div>

        {/* Detailed Financial & Rank Receipt */}
        <div className="rounded-2xl bg-surfaceElevated border border-borderMuted p-4 sm:p-5 text-left space-y-2.5 font-mono text-xs">
          <div className="flex justify-between items-center text-textMuted pb-2 border-b border-borderMuted/60">
            <span>Secured Position:</span>
            <span className="text-limeAccent font-bold text-sm">Rank #{targetRank}</span>
          </div>
          <div className="flex justify-between items-center text-textMuted">
            <span>Listing:</span>
            <span className="text-textMain font-bold truncate max-w-[200px]">{productName}</span>
          </div>
          {productUrl && (
            <div className="flex justify-between items-center text-textMuted">
              <span>Domain:</span>
              <span className="text-textMuted truncate max-w-[200px]">{productUrl.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-textMuted">
            <span>Settlement Paid:</span>
            <span className="text-emeraldAccent font-bold">${amount > 0 ? amount.toFixed(2) : 'Verified'} USD</span>
          </div>
          <div className="flex justify-between items-center text-textMuted">
            <span>Displacement Policy:</span>
            <span className="text-textMuted text-[11px]">Previous #{targetRank} shifted to #{targetRank + 1}</span>
          </div>
          {orderId && (
            <div className="flex justify-between items-center text-[10px] text-textMuted/70 pt-2 border-t border-borderMuted/60">
              <span>Receipt Ref:</span>
              <span className="truncate max-w-[160px]">{orderId}</span>
            </div>
          )}
        </div>

        {/* Dynamic Countdown & Action */}
        <div className="space-y-3 pt-1">
          <a
            href={redirectDestination}
            className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
          >
            <span>View Rank #{targetRank} on Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-xs font-mono text-textMuted">
            Redirecting to where you left off on the leaderboard in{' '}
            <strong className="text-limeAccent font-bold text-sm">{countdown}s</strong>...
          </p>
        </div>
      </div>
    );
  }

  // DISTINCT SUCCESS STATE 2: Campaign Escrow Vault Funding
  if (paymentType === 'campaign_escrow') {
    const campaignTitle = metadata?.campaign_title || 'Marketing Campaign';
    const rewardModel = metadata?.reward_model || 'cpm';

    return (
      <div className="w-full max-w-lg rounded-3xl border border-emeraldAccent/30 bg-surface p-6 sm:p-8 shadow-2xl shadow-emeraldAccent/5 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emeraldAccent/15 border border-emeraldAccent/30 text-emeraldAccent shadow-xl shadow-emeraldAccent/15 animate-bounce">
          <ShieldCheck className="h-10 w-10 text-emeraldAccent" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-emeraldAccent bg-emeraldAccent/10 border border-emeraldAccent/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Escrow Vault Locked & Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-textMain">
            Campaign Escrow Funded!
          </h1>
          <p className="text-sm text-textMuted max-w-sm mx-auto">
            Your campaign <strong className="text-white">"{campaignTitle}"</strong> is funded and live on the marketplace.
          </p>
        </div>

        {/* Escrow Details Card */}
        <div className="rounded-2xl bg-surfaceElevated border border-borderMuted p-4 sm:p-5 text-left space-y-2.5 font-mono text-xs">
          <div className="flex justify-between items-center text-textMuted pb-2 border-b border-borderMuted/60">
            <span>Escrow Deposit:</span>
            <span className="text-emeraldAccent font-bold text-sm">${amount > 0 ? amount.toFixed(2) : 'Verified'} USD</span>
          </div>
          <div className="flex justify-between items-center text-textMuted">
            <span>Campaign:</span>
            <span className="text-textMain font-bold truncate max-w-[200px]">{campaignTitle}</span>
          </div>
          <div className="flex justify-between items-center text-textMuted">
            <span>Reward Model:</span>
            <span className="text-textMain">{rewardModel === 'cpm' ? 'CPM Verified Views' : 'Custom Bounty'}</span>
          </div>
          <div className="flex justify-between items-center text-textMuted">
            <span>Disbursement Rail:</span>
            <span className="text-emeraldAccent text-[11px]">Automated Payout Protection</span>
          </div>
          {orderId && (
            <div className="flex justify-between items-center text-[10px] text-textMuted/70 pt-2 border-t border-borderMuted/60">
              <span>Dodo Order Ref:</span>
              <span className="truncate max-w-[160px]">{orderId}</span>
            </div>
          )}
        </div>

        {/* Dynamic Countdown & Action */}
        <div className="space-y-3 pt-1">
          <a
            href={redirectDestination}
            className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
          >
            <span>View Marketplace Campaigns</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-xs font-mono text-textMuted">
            Redirecting back to where you left off in{' '}
            <strong className="text-limeAccent font-bold text-sm">{countdown}s</strong>...
          </p>
        </div>
      </div>
    );
  }

  // DISTINCT SUCCESS STATE 3: Creator Payout / Withdrawal
  return (
    <div className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-surface p-6 sm:p-8 shadow-2xl shadow-purple-500/5 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-xl shadow-purple-500/15 animate-bounce">
        <Wallet className="h-10 w-10 text-purple-400" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Payout Rail Dispatched</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-textMain">
          Creator Payout Dispatched!
        </h1>
        <p className="text-sm text-textMuted max-w-sm mx-auto">
          Your funds have been transferred directly with zero platform deductions.
        </p>
      </div>

      {/* Payout Details Card */}
      <div className="rounded-2xl bg-surfaceElevated border border-borderMuted p-4 sm:p-5 text-left space-y-2.5 font-mono text-xs">
        <div className="flex justify-between items-center text-textMuted pb-2 border-b border-borderMuted/60">
          <span>Net Dispatched:</span>
          <span className="text-emeraldAccent font-bold text-sm">${amount > 0 ? amount.toFixed(2) : 'Verified'} USD</span>
        </div>
        <div className="flex justify-between items-center text-textMuted">
          <span>Platform Commission:</span>
          <span className="text-textMain font-bold">$0.00 (0% Fee)</span>
        </div>
        <div className="flex justify-between items-center text-textMuted">
          <span>Transfer Security:</span>
          <span className="text-purple-400 text-[11px]">Instant Dodo Clearing Rail</span>
        </div>
        {orderId && (
          <div className="flex justify-between items-center text-[10px] text-textMuted/70 pt-2 border-t border-borderMuted/60">
            <span>Transfer Ref:</span>
            <span className="truncate max-w-[160px]">{orderId}</span>
          </div>
        )}
      </div>

      {/* Dynamic Countdown & Action */}
      <div className="space-y-3 pt-1">
        <a
          href={redirectDestination}
          className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
        >
          <span>Return to Creator Wallet</span>
          <ArrowRight className="h-4 w-4" />
        </a>
        <p className="text-xs font-mono text-textMuted">
          Redirecting back to where you left off in{' '}
          <strong className="text-limeAccent font-bold text-sm">{countdown}s</strong>...
        </p>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-3xl border border-borderMuted bg-surface p-8 shadow-2xl text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surfaceElevated">
                <Loader2 className="h-8 w-8 animate-spin text-limeAccent" />
              </div>
              <p className="text-sm text-textMuted font-mono">Loading payment result...</p>
            </div>
          }
        >
          <PaymentResultContent />
        </Suspense>
      </main>
    </div>
  );
}
