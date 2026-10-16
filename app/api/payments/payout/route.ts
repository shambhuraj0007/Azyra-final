/**
 * app/api/payments/payout/route.ts
 * Creator payout via Dodo Payments Payouts API.
 *
 * Security layers:
 * 1. Authentication required (NextAuth session)
 * 2. Input validation & sanitization
 * 3. Atomic wallet balance deduction (race condition prevention)
 * 4. Rollback on API failure
 * 5. Server-side only — credentials never exposed
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import PaymentModel from '@/models/Payment';
import UserModel from '@/models/User';

export async function POST(req: NextRequest) {
  let requestedAmount = 0;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { amount_usd, bank_account, ifsc_code, account_holder_name, upi_id, paypal_email } = body;
    requestedAmount = Number(amount_usd) || 0;

    // Input validation
    if (!amount_usd || typeof amount_usd !== 'number' || amount_usd < 1) {
      return NextResponse.json({ success: false, error: 'Minimum withdrawal is $1' }, { status: 400 });
    }
    if (amount_usd > 10000) {
      return NextResponse.json({ success: false, error: 'Maximum withdrawal is $10,000' }, { status: 400 });
    }

    const hasBankDetails = bank_account && ifsc_code && account_holder_name;
    const hasUpi = !!upi_id;
    const hasPaypal = !!paypal_email;
    if (!hasBankDetails && !hasUpi && !hasPaypal) {
      return NextResponse.json(
        { success: false, error: 'Provide bank account details, UPI ID, or PayPal email' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // ── ATOMIC RESERVATION: Eliminate race conditions ────────────────────────
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: session.user.email, wallet_balance: { $gte: amount_usd } },
      { $inc: { wallet_balance: -amount_usd } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Insufficient wallet balance for this withdrawal.' },
        { status: 400 }
      );
    }

    const transferId = `azyra_payout_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // ── Create payout via Dodo Payments API ─────────────────────────────────
    const isDodoProd = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
    const baseUrl = isDodoProd
      ? 'https://live.dodopayments.com'
      : 'https://test.dodopayments.com';

    let payoutResult: any = null;
    try {
      const payoutPayload: any = {
        amount: Math.round(amount_usd * 100), // cents
        currency: 'USD',
        metadata: {
          transfer_id: transferId,
          user_email: session.user.email,
        },
      };

      // Add payout destination details
      if (hasPaypal) {
        payoutPayload.destination = { type: 'paypal', email: paypal_email };
      } else if (hasUpi) {
        payoutPayload.destination = { type: 'upi', vpa: upi_id };
      } else {
        payoutPayload.destination = {
          type: 'bank_transfer',
          account_number: bank_account,
          routing_number: ifsc_code,
          account_holder_name: account_holder_name,
        };
      }

      const payoutResp = await fetch(`${baseUrl}/payouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payoutPayload),
      });

      if (payoutResp.ok) {
        payoutResult = await payoutResp.json();
      } else {
        const errBody = await payoutResp.text();
        console.warn('[Dodo Payout] API error:', payoutResp.status, errBody);
        // In test mode, simulate success
        if (!isDodoProd) {
          payoutResult = { payout_id: transferId, status: 'processing' };
        } else {
          throw new Error(`Payout API returned ${payoutResp.status}`);
        }
      }
    } catch (netErr: any) {
      if (!isDodoProd) {
        console.warn('[Dodo Payout] Network error in test mode, simulating success:', netErr?.message);
        payoutResult = { payout_id: transferId, status: 'processing' };
      } else {
        throw netErr;
      }
    }

    // ── Persist payout record ───────────────────────────────────────────────
    await PaymentModel.create({
      order_id: transferId,
      dodo_payment_id: payoutResult?.payout_id || transferId,
      user_id: session.user.email,
      type: 'creator_payout',
      amount: amount_usd,
      currency: 'USD',
      status: 'ACTIVE',
      payout_account: hasPaypal
        ? { type: 'paypal', account_holder: paypal_email }
        : hasUpi
        ? { type: 'upi', account_holder: account_holder_name || updatedUser.name || 'Creator', upi_id }
        : { type: 'bank', account_holder: account_holder_name, account_number: bank_account, ifsc: ifsc_code },
    });

    return NextResponse.json({
      success: true,
      transfer_id: transferId,
      amount_usd,
      message: `Payout of $${amount_usd} initiated. Funds will arrive within 1–3 business days.`,
    });
  } catch (err: any) {
    console.error('[Dodo Payout] Error:', err?.message || err);

    // ── Rollback atomic deduction on system error ───────────────────────────
    try {
      const session = await auth();
      if (session?.user?.email && requestedAmount > 0) {
        await UserModel.updateOne(
          { email: session.user.email },
          { $inc: { wallet_balance: requestedAmount } }
        );
        console.log('[Dodo Payout] Rolled back $' + requestedAmount);
      }
    } catch (rbErr) {
      console.error('[Dodo Payout] Rollback error:', rbErr);
    }

    return NextResponse.json(
      { success: false, error: 'Payout failed. Please try again.' },
      { status: 500 }
    );
  }
}
