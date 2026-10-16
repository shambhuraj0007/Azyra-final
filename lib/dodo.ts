/**
 * lib/dodo.ts
 * Server-side Dodo Payments SDK wrapper.
 * SECURITY: This file is ONLY imported from server-side route handlers (app/api/).
 * Never import this in client components or pages.
 *
 * Dodo Payments operates as a Merchant of Record (MoR) and natively supports
 * USD, EUR, and 30+ currencies with global credit cards, Apple Pay, Google Pay.
 * No INR conversion needed — amounts are in USD cents.
 */
import DodoPayments from 'dodopayments';

// ─── Validate critical environment variables ──────────────────────────────────
const apiKey = process.env.DODO_PAYMENTS_API_KEY;
if (!apiKey) {
  console.warn('[Dodo] DODO_PAYMENTS_API_KEY is not set. Payment operations will fail.');
}

// ─── Determine environment ────────────────────────────────────────────────────
const isDodoProd = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';

// ─── Initialize SDK instance ──────────────────────────────────────────────────
const dodoClient = new DodoPayments({
  bearerToken: apiKey,
  environment: isDodoProd ? 'live_mode' : 'test_mode',
});

export { dodoClient, isDodoProd };

// ─── Amount helpers ───────────────────────────────────────────────────────────
// Dodo Payments accepts amounts in the lowest currency unit (cents for USD).
// Our app stores amounts in USD (dollars). These helpers convert between them.

/** Convert USD dollars to cents (lowest unit) */
export const usdToCents = (usd: number): number => Math.round(usd * 100);

/** Convert cents back to USD dollars */
export const centsToUsd = (cents: number): number => Number((cents / 100).toFixed(2));
