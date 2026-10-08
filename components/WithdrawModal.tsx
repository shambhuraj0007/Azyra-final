'use client';

import { useState } from 'react';
import { X, CheckCircle2, Wallet, ArrowRight, ShieldCheck, Building } from 'lucide-react';
import { useCampaigns } from '../lib/CampaignContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { currentUser, withdrawCreatorBalance } = useCampaigns();
  const [amount, setAmount] = useState<string>(currentUser.wallet_balance.toFixed(2));
  const [success, setSuccess] = useState(false);
  const [paidOut, setPaidOut] = useState(0);

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = parseFloat(amount) || currentUser.wallet_balance;
    const res = withdrawCreatorBalance(withdrawAmt);
    if (res.success) {
      setPaidOut(res.payoutAmount);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-borderMuted bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-textMuted hover:bg-surfaceElevated hover:text-textMain transition"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emeraldAccent/15 text-emeraldAccent ring-2 ring-emeraldAccent/30 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-heading font-bold text-textMain">Payout Initiated!</h3>
            <p className="text-xs text-textMuted">
              <strong className="text-emeraldAccent font-mono text-sm">${paidOut.toFixed(2)}</strong> has been transferred via {currentUser?.payoutMethod?.type === 'bank' ? 'Direct Bank ACH Transfer' : currentUser?.payoutMethod?.type === 'paypal' ? 'PayPal' : currentUser?.payoutMethod?.type === 'crypto' ? 'Web3 Wallet' : 'Stripe Express'} to your verified account <strong className="text-textMain">{currentUser?.payoutMethod?.accountIdentifier || 'Chase ****4182'}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emeraldAccent text-[#0B0F10] font-heading font-bold shadow-md shadow-emeraldAccent/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-textMain">Withdraw Creator Balance</h3>
                <p className="text-xs text-textMuted">
                  {currentUser?.payoutMethod?.type === 'bank'
                    ? 'Direct Bank ACH / Wire Transfer'
                    : currentUser?.payoutMethod?.type === 'paypal'
                    ? 'Instant PayPal Payout'
                    : currentUser?.payoutMethod?.type === 'crypto'
                    ? 'Instant Web3 Transfer'
                    : 'Instant payout via Stripe Connect'}
                </p>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3.5 space-y-2">
                <div className="flex justify-between text-xs text-textMuted">
                  <span>Available Balance:</span>
                  <strong className="font-mono text-emeraldAccent text-sm">
                    ${currentUser.wallet_balance.toFixed(2)}
                  </strong>
                </div>

                <div className="pt-2 border-t border-borderMuted">
                  <label className="block text-[11px] font-heading font-bold uppercase text-textMuted mb-1">
                    Withdrawal Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={currentUser.wallet_balance}
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg bg-surface border border-borderMuted px-3 py-2 text-sm font-mono font-bold text-textMain focus:border-emeraldAccent outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-surfaceElevated p-3 border border-borderMuted flex items-center justify-between text-xs text-textMuted">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-emeraldAccent" />
                  <span className="truncate max-w-[220px]">
                    {currentUser?.payoutMethod?.type === 'bank'
                      ? `Bank: ${currentUser.payoutMethod?.bankDetails?.bankName || 'Direct'} (${currentUser.payoutMethod.accountIdentifier})`
                      : currentUser?.payoutMethod?.type === 'paypal'
                      ? `PayPal: ${currentUser.payoutMethod.accountIdentifier}`
                      : currentUser?.payoutMethod?.type === 'crypto'
                      ? `Crypto: ${currentUser.payoutMethod.accountIdentifier}`
                      : `Stripe: ${currentUser?.payoutMethod?.accountIdentifier || 'Chase ****4182'}`}
                  </span>
                </div>
                <span className="text-emeraldAccent font-mono font-bold shrink-0">Instant (0% fee)</span>
              </div>

              <button
                type="submit"
                disabled={currentUser.wallet_balance <= 0}
                className="w-full rounded-xl bg-emeraldAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3 text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
              >
                <span>
                  {currentUser?.payoutMethod?.type === 'bank'
                    ? `Transfer $${amount} to Bank Account`
                    : `Transfer $${amount} to Account`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
