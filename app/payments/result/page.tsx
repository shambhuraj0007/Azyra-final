'use client';

/**
 * app/payments/result/page.tsx
 * Landing page after Dodo Payments redirects back. Polls server for final status.
 * NOTE: Wrapped in <Suspense> for Next.js static prerendering compatibility.
 */
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type ResultState = 'checking' | 'paid' | 'failed' | 'pending';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [state, setState] = useState<ResultState>('checking');

  useEffect(() => {
    if (!orderId) { setState('failed'); return; }

    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status?order_id=${orderId}`);
        const data = await res.json();

        if (data.status === 'PAID') {
          setState('paid');
        } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
          setState('failed');
        } else if (attempts < 8) {
          setTimeout(poll, 2500);
        } else {
          setState('pending');
        }
      } catch {
        setState('failed');
      }
    };
    poll();
  }, [orderId]);

  const icon = {
    checking: <Loader2 className="h-12 w-12 animate-spin text-limeAccent" />,
    paid: <CheckCircle2 className="h-12 w-12 text-emeraldAccent animate-bounce" />,
    failed: <XCircle className="h-12 w-12 text-red-400" />,
    pending: <Loader2 className="h-12 w-12 text-amber-400" />,
  }[state];

  const title = {
    checking: 'Verifying payment…',
    paid: 'Payment Successful!',
    failed: 'Payment Failed',
    pending: 'Payment Pending',
  }[state];

  const subtitle = {
    checking: 'Please wait while we confirm your transaction.',
    paid: 'Your escrow has been funded. Your campaign is now live on the marketplace.',
    failed: 'Your payment was not completed. No funds were deducted.',
    pending: 'We are still waiting for confirmation. Check back in a few minutes.',
  }[state];

  return (
    <div className="w-full max-w-md rounded-3xl border border-borderMuted bg-surface p-8 shadow-2xl text-center space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surfaceElevated border border-borderMuted">
        {icon}
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-heading font-bold text-textMain">{title}</h1>
        <p className="text-sm text-textMuted leading-relaxed">{subtitle}</p>
        {orderId && (
          <p className="text-[11px] font-mono text-textMuted">Ref: {orderId}</p>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {state === 'paid' && (
          <Link
            href="/campaigns"
            className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/20 transition"
          >
            <span>View Campaigns</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {(state === 'failed' || state === 'pending') && (
          <Link
            href="/campaigns"
            className="w-full rounded-xl bg-surface border border-borderMuted text-textMain font-heading font-bold py-3 text-sm flex items-center justify-center gap-2 hover:bg-surfaceElevated transition"
          >
            Back to Campaigns
          </Link>
        )}
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
