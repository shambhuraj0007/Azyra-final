/**
 * app/api/payments/status/route.ts
 * Returns the webhook-verified payment status from our database.
 *
 * Security:
 * - Requires authenticated session
 * - Only returns status for the authenticated user's own orders
 * - Falls back to Dodo API polling if webhook hasn't arrived yet
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import PaymentModel from '@/models/Payment';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    // Input validation
    if (!orderId || typeof orderId !== 'string' || orderId.length > 100) {
      return NextResponse.json({ success: false, error: 'order_id is required' }, { status: 400 });
    }

    // Sanitize — only allow alphanumeric, underscore, hyphen
    if (!/^[a-zA-Z0-9_-]+$/.test(orderId)) {
      return NextResponse.json({ success: false, error: 'Invalid order_id format' }, { status: 400 });
    }

    await connectToDatabase();

    const paymentRecord = await PaymentModel.findOne({ order_id: orderId });
    if (!paymentRecord || paymentRecord.user_id !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // If already finalized (webhook-verified), return DB status directly
    if (['PAID', 'FAILED', 'REFUNDED'].includes(paymentRecord.status)) {
      return NextResponse.json({
        success: true,
        status: paymentRecord.status,
        type: paymentRecord.type,
        amount: paymentRecord.amount,
        redirect_url: paymentRecord.redirect_url || null,
        metadata: paymentRecord.metadata || null,
        campaign_id: paymentRecord.campaign_id || null,
        webhook_verified: paymentRecord.webhook_verified,
      });
    }

    // If not yet finalized, check Dodo API for latest status
    // This is a fallback for when webhooks are delayed
    try {
      const isDodoProd = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
      const baseUrl = isDodoProd
        ? 'https://live.dodopayments.com'
        : 'https://test.dodopayments.com';

      if (paymentRecord.dodo_payment_id) {
        const dodoResp = await fetch(
          `${baseUrl}/payments/${paymentRecord.dodo_payment_id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
            },
          }
        );

        if (dodoResp.ok) {
          const dodoData = await dodoResp.json();
          const dodoStatus = dodoData?.status;

          let mappedStatus = paymentRecord.status;
          if (dodoStatus === 'succeeded' || dodoStatus === 'completed') mappedStatus = 'PAID';
          else if (dodoStatus === 'failed') mappedStatus = 'FAILED';
          else if (dodoStatus === 'cancelled' || dodoStatus === 'expired') mappedStatus = 'EXPIRED';

          if (mappedStatus !== paymentRecord.status) {
            await PaymentModel.updateOne(
              { order_id: orderId },
              { status: mappedStatus, updated_at: Date.now() }
            );
          }

          return NextResponse.json({
            success: true,
            status: mappedStatus,
            dodo_status: dodoStatus,
            type: paymentRecord.type,
            amount: paymentRecord.amount,
            redirect_url: paymentRecord.redirect_url || null,
            metadata: paymentRecord.metadata || null,
            campaign_id: paymentRecord.campaign_id || null,
            webhook_verified: paymentRecord.webhook_verified,
          });
        }
      }
    } catch (pollErr: any) {
      console.warn('[Dodo Status] Polling fallback error:', pollErr?.message);
      // Fall through to return DB status
    }

    return NextResponse.json({
      success: true,
      status: paymentRecord.status,
      type: paymentRecord.type,
      amount: paymentRecord.amount,
      redirect_url: paymentRecord.redirect_url || null,
      metadata: paymentRecord.metadata || null,
      campaign_id: paymentRecord.campaign_id || null,
      webhook_verified: paymentRecord.webhook_verified,
    });
  } catch (err: any) {
    console.error('[Dodo Status] Error:', err?.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch payment status' }, { status: 500 });
  }
}
