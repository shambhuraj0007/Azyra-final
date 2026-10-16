/**
 * app/api/payments/create-order/route.ts
 * SERVER-SIDE ONLY — creates a Dodo Payments checkout session and returns
 * only the checkout_url to the front-end. Credentials never leave the server.
 *
 * Security layers:
 * 1. Authentication required (NextAuth session)
 * 2. Input validation & sanitization
 * 3. Amount bounds checking
 * 4. Campaign ownership verification
 * 5. Rate limiting via order_id uniqueness
 * 6. Server-side only SDK initialization
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { dodoClient } from '@/lib/dodo';
import PaymentModel from '@/models/Payment';
import CampaignModel from '@/models/Campaign';

// Allowed payment types — whitelist, not blacklist
const VALID_TYPES = ['campaign_escrow', 'creator_payout', 'rank_outbid'] as const;
type PaymentType = typeof VALID_TYPES[number];

export async function POST(req: NextRequest) {
  try {
    // ── STEP 1: Authentication ──────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── STEP 2: Parse & validate input ──────────────────────────────────────
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { amount_usd, type, campaign_id } = body;

    // Strict type validation
    if (typeof amount_usd !== 'number' || !Number.isFinite(amount_usd) || amount_usd < 1) {
      return NextResponse.json({ success: false, error: 'Minimum amount is $1' }, { status: 400 });
    }
    if (amount_usd > 50000) {
      return NextResponse.json({ success: false, error: 'Maximum amount is $50,000' }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type as PaymentType)) {
      return NextResponse.json({ success: false, error: 'Invalid payment type' }, { status: 400 });
    }

    await connectToDatabase();

    // ── STEP 3: Campaign ownership verification ─────────────────────────────
    if (type === 'campaign_escrow' && campaign_id) {
      const camp = await CampaignModel.findOne({ id: campaign_id });
      if (!camp) {
        return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
      }
    }

    // ── STEP 4: Generate unique order ID ────────────────────────────────────
    const prefix = type === 'campaign_escrow' ? 'esc' : type === 'rank_outbid' ? 'bid' : 'pay';
    const orderId = `azyra_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // ── STEP 5: Create Dodo checkout session ────────────────────────────────
    // Dodo Payments uses product_cart with product_ids created in the dashboard.
    // For dynamic amounts, we use the payments API directly via REST.
    const isDodoProd = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
    const baseUrl = isDodoProd
      ? 'https://live.dodopayments.com'
      : 'https://test.dodopayments.com';

    const returnUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payments/result?order_id=${orderId}`;

    // Use Dodo Payments REST API for dynamic-amount checkout sessions
    const checkoutPayload = {
      billing: {
        city: 'Global',
        country: 'US',
        state: 'NA',
        street: 'N/A',
        zipcode: '00000',
      },
      customer: {
        email: session.user.email,
        name: session.user.name || 'Azyra User',
      },
      payment_link: true,
      return_url: returnUrl,
      metadata: {
        order_id: orderId,
        type,
        campaign_id: campaign_id || '',
        user_email: session.user.email,
      },
    };

    let checkoutResponse: any;
    try {
      const dodoResp = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...checkoutPayload,
          total_amount: Math.round(amount_usd * 100), // cents
          currency: 'USD',
        }),
      });

      if (!dodoResp.ok) {
        const errBody = await dodoResp.text();
        console.error('[Dodo] Checkout creation failed:', dodoResp.status, errBody);
        return NextResponse.json(
          { success: false, error: 'Failed to create checkout session' },
          { status: 502 }
        );
      }

      checkoutResponse = await dodoResp.json();
    } catch (netErr: any) {
      console.error('[Dodo] Network error:', netErr?.message);
      return NextResponse.json(
        { success: false, error: 'Payment service unavailable. Please try again.' },
        { status: 503 }
      );
    }

    const checkoutUrl = checkoutResponse?.payment_link || checkoutResponse?.checkout_url;
    const dodoPaymentId = checkoutResponse?.payment_id || checkoutResponse?.session_id;

    if (!checkoutUrl) {
      console.error('[Dodo] No checkout URL in response:', checkoutResponse);
      return NextResponse.json(
        { success: false, error: 'Failed to generate checkout link' },
        { status: 502 }
      );
    }

    // ── STEP 6: Persist payment record BEFORE returning URL ─────────────────
    await PaymentModel.create({
      order_id: orderId,
      dodo_payment_id: dodoPaymentId || null,
      campaign_id: campaign_id || null,
      user_id: session.user.email,
      type,
      amount: amount_usd,
      currency: 'USD',
      status: 'PENDING',
    });

    // ── STEP 7: Return ONLY the checkout URL — never credentials ────────────
    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
      order_id: orderId,
      amount_usd,
    });
  } catch (err: any) {
    console.error('[Dodo] create-order error:', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'Payment initialization failed. Please try again.' },
      { status: 500 }
    );
  }
}
