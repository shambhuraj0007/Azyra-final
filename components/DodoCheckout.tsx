'use client';

/**
 * components/DodoCheckout.tsx
 * Front-end Dodo Payments Checkout component.
 *
 * Security model:
 * - NEVER stores credentials. Only receives checkout_url from server.
 * - Uses Dodo Payments hosted checkout (PCI-DSS Level 1, SOC 2 Type II).
 * - Polls /api/payments/status for final server-verified confirmation.
 * - Never trusts return_url query params for fulfillment.
 */
import { useState, useCallback } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, XCircle, CreditCard, ExternalLink } from 'lucide-react';

interface DodoCheckoutProps {
  amountUsd: number;
  type: 'campaign_escrow' | 'creator_payout' | 'rank_outbid';
  campaignId?: string;
  campaignTitle?: string;
  onSuccess: (orderId: string) => void;
  onError?: (err: string) => void;
}

type CheckoutState = 'idle' | 'loading' | 'processing' | 'success' | 'failed';

export default function DodoCheckout({
  amountUsd,
  type,
  campaignId,
  campaignTitle,
  onSuccess,
  onError,
}: DodoCheckoutProps) {
  const [state, setState] = useState<CheckoutState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const pollPaymentStatus = useCallback(async (oid: string, retries = 15): Promise<void> => {
    if (retries <= 0) {
      setState('failed');
      setErrorMsg('Payment verification timed out. If money was deducted, contact support.');
      onError?.('Timeout');
      return;
    }

    await new Promise((r) => setTimeout(r, 3000));

    try {
      const res = await fetch(`/api/payments/status?order_id=${encodeURIComponent(oid)}`);
      const data = await res.json();

      if (data.status === 'PAID') {
        setState('success');
        onSuccess(oid);
      } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
        setState('failed');
        setErrorMsg('Payment was not completed. Please try again.');
        onError?.('Payment failed');
      } else {
        await pollPaymentStatus(oid, retries - 1);
      }
    } catch {
      // Network error — keep retrying
      await pollPaymentStatus(oid, retries - 1);
    }
  }, [onSuccess, onError]);

  const handlePay = async () => {
    setState('loading');
    setErrorMsg(null);

    try {
      // Step 1: Request checkout session from OUR server (never Dodo directly)
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_usd: amountUsd,
          type,
          campaign_id: campaignId,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.checkout_url) {
        throw new Error(orderData.error || 'Could not initialize payment');
      }

      setOrderId(orderData.order_id);

      // Step 2: Open Dodo hosted checkout in a new tab
      // (Dodo's checkout page handles all card data — PCI compliant)
      const checkoutWindow = window.open(orderData.checkout_url, '_blank');

      if (!checkoutWindow) {
        // Popup blocked — fallback to same-tab redirect
        window.location.href = orderData.checkout_url;
        return;
      }

      setState('processing');

      // Step 3: Poll server for webhook-verified payment status
      // (Do NOT trust return_url redirect alone — server webhook is ground truth)
      await pollPaymentStatus(orderData.order_id);

    } catch (err: any) {
      console.error('[DodoCheckout]', err);
      setState('failed');
      setErrorMsg(err.message || 'Payment failed. Please try again.');
      onError?.(err.message);
    }
  };

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emeraldAccent/15 text-emeraldAccent ring-2 ring-emeraldAccent/30 animate-bounce">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h4 className="text-lg font-heading font-bold text-textMain">Payment Confirmed!</h4>
        <p className="text-xs text-textMuted">
          {type === 'campaign_escrow'
            ? `$${amountUsd.toFixed(2)} escrow deposited. Your campaign is now live.`
            : type === 'rank_outbid'
            ? `$${amountUsd.toFixed(2)} rank settlement paid. Your leaderboard position is secured.`
            : `$${amountUsd.toFixed(2)} payout initiated.`}
        </p>
        {orderId && (
          <span className="font-mono text-[10px] text-textMuted">Ref: {orderId}</span>
        )}
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-400 ring-2 ring-red-500/30">
          <XCircle className="h-8 w-8" />
        </div>
        <h4 className="text-base font-heading font-bold text-textMain">Payment Failed</h4>
        <p className="text-xs text-textMuted max-w-xs">{errorMsg}</p>
        <button
          onClick={() => { setState('idle'); setErrorMsg(null); }}
          className="mt-2 rounded-xl bg-surface border border-borderMuted px-4 py-2 text-xs font-heading font-bold text-textMain hover:bg-surfaceElevated transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-textMuted">
          <span className="font-heading font-bold uppercase">
            {type === 'campaign_escrow'
              ? '💰 Escrow Deposit'
              : type === 'rank_outbid'
              ? '🚀 Rank Outbid Settlement'
              : '💸 Creator Withdrawal'}
          </span>
          <span className="font-mono font-bold text-textMain text-sm">${amountUsd.toFixed(2)}</span>
        </div>
        {campaignTitle && (
          <div className="flex items-center justify-between text-[11px] text-textMuted border-t border-borderMuted pt-2">
            <span>Campaign</span>
            <span className="font-heading font-bold text-textMain truncate max-w-[160px]">{campaignTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emeraldAccent">
          <ShieldCheck className="h-3 w-3" />
          <span>PCI-DSS Level 1 · SOC 2 Type II · End-to-end encrypted</span>
        </div>
      </div>

      {/* Accepted Payment Methods */}
      <div className="flex items-center gap-2 flex-wrap">
        {['Credit Card', 'Apple Pay', 'Google Pay', 'Link'].map((m) => (
          <span
            key={m}
            className="rounded-lg bg-surface border border-borderMuted px-2 py-1 text-[10px] font-mono text-textMuted"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Pay Button */}
      <button
        id="dodo-pay-btn"
        onClick={handlePay}
        disabled={state === 'loading' || state === 'processing'}
        className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3.5 text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === 'loading' || state === 'processing' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{state === 'loading' ? 'Initializing...' : 'Verifying Payment...'}</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>Pay ${amountUsd.toFixed(2)}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-textMuted">
        Secured by{' '}
        <a
          href="https://dodopayments.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-limeAccent hover:underline"
        >
          Dodo Payments
        </a>
        {' '}· No card data stored on Azyra servers
      </p>
    </div>
  );
}
