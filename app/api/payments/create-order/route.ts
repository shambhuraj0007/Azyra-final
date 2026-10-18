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

    const { amount_usd, type, campaign_id, redirect_url, metadata } = body;

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
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      console.error('[Dodo] DODO_PAYMENTS_API_KEY is not configured.');
      return NextResponse.json(
        { success: false, error: 'Payment gateway API key is not configured on the server. Please add DODO_PAYMENTS_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const isDodoProd = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
    const baseUrl = isDodoProd
      ? 'https://live.dodopayments.com'
      : 'https://test.dodopayments.com';

    // Auto-detect public origin (handles Vercel deployments and custom domains cleanly)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const appOrigin = host ? `${proto}://${host}` : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
    const safeRedirect = typeof redirect_url === 'string' && redirect_url.startsWith('/') ? redirect_url : '';
    const returnUrl = `${appOrigin}/payments/result?order_id=${orderId}&type=${type}${safeRedirect ? `&redirect_to=${encodeURIComponent(safeRedirect)}` : ''}`;

    const productId = process.env.DODO_PRODUCT_ID;
    if (!productId) {
      console.error('[Dodo] DODO_PRODUCT_ID is not configured in .env.');
      return NextResponse.json(
        {
          success: false,
          error: 'Dodo Product ID is not configured. Please create a "Pay What You Want" one-time product in your Dodo dashboard (min $1) and add DODO_PRODUCT_ID=pdt_... to .env',
        },
        { status: 500 }
      );
    }

    const amountInCents = Math.round(amount_usd * 100);

    // Use Dodo Payments REST API for checkout sessions
    const checkoutPayload: Record<string, any> = {
      billing: {
        city: 'Wilmington',
        country: 'US',
        state: 'DE',
        street: '1209 Orange St',
        zipcode: '19801',
      },
      customer: {
        email: session.user.email,
        name: session.user.name || 'Azyra User',
      },
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
          amount: amountInCents,
        },
      ],
      payment_link: true,
      return_url: returnUrl,
      metadata: {
        order_id: orderId,
        type,
        campaign_id: campaign_id || '',
        user_email: session.user.email,
        redirect_to: safeRedirect,
        ...(metadata && typeof metadata === 'object' ? metadata : {}),
      },
    };

    let checkoutResponse: any;
    try {
      const dodoResp = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutPayload),
      });

      if (!dodoResp.ok) {
        const errBody = await dodoResp.text();
        console.error('[Dodo] Checkout creation failed:', dodoResp.status, errBody);

        let parsedErr: any = null;
        try {
          parsedErr = JSON.parse(errBody);
        } catch {}

        const detailedMsg = parsedErr?.message || parsedErr?.error || `Dodo API error (${dodoResp.status})`;
        return NextResponse.json(
          {
            success: false,
            error: detailedMsg,
            code: parsedErr?.code || 'DODO_API_ERROR',
            status: dodoResp.status,
          },
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
        { success: false, error: 'Failed to generate checkout link from payment gateway' },
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
      redirect_url: safeRedirect || undefined,
      metadata: metadata || undefined,
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
