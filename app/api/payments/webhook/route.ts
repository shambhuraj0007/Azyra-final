/**
 * app/api/payments/webhook/route.ts
 * Dodo Payments Webhook Handler using Standard Webhooks specification.
 *
 * Security layers implemented:
 * 1. Standard Webhooks HMAC-SHA256 signature verification (mandatory)
 * 2. Timestamp replay-attack prevention (built into standardwebhooks)
 * 3. Idempotency check — ignores already-processed events
 * 4. Amount double-check against DB record (price-tampering prevention)
 * 5. Raw body parsing — no JSON pre-parsing that would corrupt signatures
 */
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { connectToDatabase } from '@/lib/mongodb';
import PaymentModel from '@/models/Payment';
import CampaignModel from '@/models/Campaign';
import UserModel from '@/models/User';

export async function POST(req: NextRequest) {
  // ── STEP 1: Read raw body for signature verification ──────────────────────
  const rawBody = await req.text();

  const webhookId = req.headers.get('webhook-id') || '';
  const webhookSignature = req.headers.get('webhook-signature') || '';
  const webhookTimestamp = req.headers.get('webhook-timestamp') || '';

  // ── STEP 2: Verify Standard Webhooks signature ────────────────────────────
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookSecret) {
    console.error('[Webhook] DODO_PAYMENTS_WEBHOOK_KEY is not set.');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    console.warn('[Webhook] Missing standard webhook headers');
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
  }

  let payload: any;
  try {
    const wh = new Webhook(webhookSecret);
    // verify() throws on invalid signature or expired timestamp
    payload = wh.verify(rawBody, {
      'webhook-id': webhookId,
      'webhook-signature': webhookSignature,
      'webhook-timestamp': webhookTimestamp,
    });
  } catch (verifyErr: any) {
    console.error('[Webhook] Signature verification FAILED:', verifyErr?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── STEP 3: Extract event data ────────────────────────────────────────────
  const eventType = payload?.type || payload?.event_type;
  const paymentData = payload?.data || payload;

  // Extract our custom order_id from metadata
  const metadata = paymentData?.metadata || {};
  const orderId = metadata?.order_id;
  const dodoPaymentId = paymentData?.payment_id;

  if (!orderId) {
    console.warn('[Webhook] No order_id in metadata. Event:', eventType);
    // Return 200 so Dodo doesn't keep retrying for events we don't track
    return NextResponse.json({ received: true });
  }

  await connectToDatabase();

  // ── STEP 4: Load stored payment record ────────────────────────────────────
  const paymentRecord = await PaymentModel.findOne({ order_id: orderId });
  if (!paymentRecord) {
    console.warn('[Webhook] Unknown order_id:', orderId);
    return NextResponse.json({ received: true });
  }

  // ── STEP 5: Idempotency — skip already-processed events ──────────────────
  const webhookTs = Number(webhookTimestamp);
  if (
    paymentRecord.webhook_verified &&
    paymentRecord.last_webhook_timestamp &&
    paymentRecord.last_webhook_timestamp >= webhookTs
  ) {
    console.log('[Webhook] Already processed. Skipping duplicate.');
    return NextResponse.json({ received: true });
  }

  // ── STEP 6: Validate amount (price-tampering prevention) ──────────────────
  // Dodo sends amounts in cents; our DB stores in USD dollars
  const receivedAmountCents = Number(paymentData?.total_amount || paymentData?.amount || 0);
  const expectedAmountCents = Math.round(paymentRecord.amount * 100);
  if (receivedAmountCents > 0 && Math.abs(receivedAmountCents - expectedAmountCents) > 10) {
    console.error(
      `[Webhook] AMOUNT MISMATCH for ${orderId}. Expected ${expectedAmountCents}¢, got ${receivedAmountCents}¢`
    );
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  // ── STEP 7: Handle event ──────────────────────────────────────────────────
  let newStatus: string = paymentRecord.status;

  if (
    eventType === 'payment.succeeded' ||
    eventType === 'payment.completed' ||
    paymentData?.status === 'succeeded'
  ) {
    newStatus = 'PAID';

    // Credit campaign escrow or activate campaign
    if (paymentRecord.type === 'campaign_escrow' && paymentRecord.campaign_id) {
      await CampaignModel.updateOne(
        { id: paymentRecord.campaign_id },
        { status: 'active', $set: { remaining_budget: paymentRecord.amount } }
      );
    }

    // Credit creator wallet for payouts
    if (paymentRecord.type === 'creator_payout') {
      await UserModel.updateOne(
        { email: paymentRecord.user_id },
        { $inc: { wallet_balance: paymentRecord.amount } }
      );
    }
  } else if (
    eventType === 'payment.failed' ||
    paymentData?.status === 'failed'
  ) {
    newStatus = 'FAILED';
  } else if (
    eventType === 'payment.cancelled' ||
    eventType === 'payment.expired'
  ) {
    newStatus = 'EXPIRED';
  }

  // ── STEP 8: Persist verified webhook data ─────────────────────────────────
  await PaymentModel.updateOne(
    { order_id: orderId },
    {
      status: newStatus,
      dodo_payment_id: dodoPaymentId || paymentRecord.dodo_payment_id,
      webhook_verified: true,
      webhook_payload: payload,
      last_webhook_timestamp: webhookTs,
      updated_at: Date.now(),
    }
  );

  console.log(`[Webhook] Processed ${eventType} for order ${orderId} → ${newStatus}`);
  return NextResponse.json({ received: true });
}
