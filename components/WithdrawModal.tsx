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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-white">Payout Initiated!</h3>
            <p className="text-xs text-zinc-400">
              <strong className="text-emerald-400 font-mono text-sm">${paidOut.toFixed(2)}</strong> has been transferred via Stripe Express to your verified bank account ending in <strong className="text-white">****4182</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-black">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Withdraw Creator Balance</h3>
                <p className="text-xs text-zinc-400">Instant payout via Stripe Connect</p>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Available Balance:</span>
                  <strong className="font-mono text-emerald-400 text-sm">
                    ${currentUser.wallet_balance.toFixed(2)}
                  </strong>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                    Withdrawal Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={currentUser.wallet_balance}
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm font-mono font-bold text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-zinc-500" />
                  <span>Stripe Connected: Chase ****4182</span>
                </div>
                <span className="text-emerald-400 font-bold">Instant (0% fee)</span>
              </div>

              <button
                type="submit"
                disabled={currentUser.wallet_balance <= 0}
                className="w-full rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black py-3 text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <span>Transfer ${amount} to Bank Account</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
