'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, CheckCircle, ArrowRight, ShieldCheck, AlertCircle, Coins, Flame } from 'lucide-react';
import { ProductEntry, BoardType } from '../lib/types';
import { calculateRequiredBid } from '../lib/data';

interface ClaimRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetRank?: number;
  initialProductUrl?: string;
  board: BoardType;
  products: ProductEntry[];
  onPlaceBid: (payload: {
    productName: string;
    productUrl: string;
    tagline: string;
    logo: string;
    category: ProductEntry['category'];
    bidAmount: number; // additional capital being paid
    targetRank: number;
    isBump: boolean;
  }) => void;
}

export default function ClaimRankModal({
  isOpen,
  onClose,
  initialTargetRank = 1,
  initialProductUrl = '',
  board,
  products,
  onPlaceBid,
}: ClaimRankModalProps) {
  const [targetRank, setTargetRank] = useState<number>(initialTargetRank);
  const [url, setUrl] = useState<string>(initialProductUrl);
  const [name, setName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [logo, setLogo] = useState<string>('🚀');
  const [category, setCategory] = useState<ProductEntry['category']>('AI & ML');
  const [customBid, setCustomBid] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTargetRank(initialTargetRank || 1);
      setUrl(initialProductUrl || '');
      setSubmitted(false);
    }
  }, [isOpen, initialTargetRank, initialProductUrl]);

  // Clean URL comparison to check if already on the board
  const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
  const existingProduct = useMemo(() => {
    if (!cleanUrl) return null;
    return products.find(
      (p) => p.url.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
    );
  }, [cleanUrl, products]);

  // Auto-fill fields if recognized
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setTagline(existingProduct.tagline);
      setLogo(existingProduct.logo);
      setCategory(existingProduct.category);
    }
  }, [existingProduct]);

  // Calculate required math based on prompt rules
  const bidCalculation = useMemo(() => {
    return calculateRequiredBid({
      targetRank,
      sortedProducts: products,
      board,
      existingProductUrl: url,
    });
  }, [targetRank, products, board, url]);

  // Minimum required additional payment
  const minNetPayable = bidCalculation.netPayable;
  const enteredAmount = customBid ? parseFloat(customBid) : minNetPayable;

  const currentHolder = bidCalculation.currentHolder;
  const isTargetingNumberOne = targetRank === 1;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;

    if (enteredAmount < minNetPayable) {
      alert(`Minimum payment to claim Rank #${targetRank} is $${minNetPayable.toLocaleString()}`);
      return;
    }

    onPlaceBid({
      productName: name,
      productUrl: url.startsWith('http') ? url : `https://${url}`,
      tagline: tagline || 'Next-generation tech & software',
      logo: logo || '🚀',
      category,
      bidAmount: enteredAmount,
      targetRank,
      isBump: !!existingProduct,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl shadow-black/80 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30 animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Outbid Successful!</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Your transaction has settled on the financial protocol. <strong className="text-amber-400">{name}</strong> is now claiming <strong className="text-white">Rank #{targetRank}</strong>!
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 font-black shadow-md shadow-amber-500/30">
                <Coins className="h-6 w-6 fill-zinc-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Claim Rank #{targetRank}
                  </h2>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                    {board === 'all-time' ? 'All-Time Board' : 'Today Board'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Pure financial bidding. No algorithms, no waitlists. Highest spend wins.
                </p>
              </div>
            </div>

            {/* Target Rank Picker pills */}
            <div className="mb-6 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Select Target Rank to Claim:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5, 8, 10].map((rk) => (
                  <button
                    key={rk}
                    type="button"
                    onClick={() => {
                      setTargetRank(rk);
                      setCustomBid('');
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      targetRank === rk
                        ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20 scale-105'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    #{rk} {rk === 1 ? '👑' : ''}
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-zinc-500">Custom #</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={targetRank}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setTargetRank(Math.max(1, val));
                      setCustomBid('');
                    }}
                    className="w-16 rounded bg-zinc-800 px-2 py-1 text-xs text-white border border-zinc-700 text-center font-bold focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Status of spot */}
              {currentHolder && (
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs text-zinc-400">
                  <span>
                    Current #{targetRank} Holder:{' '}
                    <strong className="text-zinc-200">
                      {currentHolder.logo} {currentHolder.name}
                    </strong>
                  </span>
                  <span>
                    Their Total Spend:{' '}
                    <strong className="font-mono text-zinc-200">
                      ${(board === 'all-time' ? currentHolder.allTimeSpend : currentHolder.todaySpend).toLocaleString()}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product URL input */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Product Website URL <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://yourproduct.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none font-mono"
                />
              </div>

              {/* Existing Product Recognition Notice (Rule 2: Bump mechanic) */}
              {existingProduct ? (
                <div className="rounded-xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/30 p-3.5 flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-emerald-400">
                      Existing Product Recognized: {existingProduct.name}
                    </div>
                    <div className="text-zinc-300 mt-0.5">
                      You already contributed{' '}
                      <strong className="font-mono text-emerald-300">
                        ${bidCalculation.existingSpend.toLocaleString()}
                      </strong>{' '}
                      on this board. Under the bump rule, you only pay the{' '}
                      <span className="font-bold text-white underline">difference</span> to claim Rank #{targetRank}!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Product Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Studio"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
                    >
                      <option value="AI & ML">AI & ML</option>
                      <option value="DevTools">DevTools</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Web3">Web3</option>
                      <option value="Design">Design</option>
                      <option value="Productivity">Productivity</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Tagline (Catchy pitch)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Next-generation AI code companion for fast teams"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Financial Calculation Breakdown Card */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-4 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span>Transparent Capital Calculation</span>
                  {isTargetingNumberOne && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-300 font-normal">
                      <Flame className="h-3 w-3 fill-amber-400" />
                      Must outbid #1 by +$5 minimum
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1.5 text-zinc-300 pt-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Spend Required for Rank #{targetRank}:</span>
                    <span className="font-mono font-semibold text-white">
                      ${bidCalculation.targetSpendRequired.toLocaleString()}
                    </span>
                  </div>

                  {existingProduct && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Existing Lifetime Credit (Bump Rule):</span>
                      <span className="font-mono font-semibold">
                        -${bidCalculation.existingSpend.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-white">
                      Net Payable to Claim Spot:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 font-mono text-xs">$</span>
                      <input
                        type="number"
                        min={minNetPayable}
                        value={customBid === '' ? minNetPayable : customBid}
                        onChange={(e) => setCustomBid(e.target.value)}
                        className="w-28 rounded-lg bg-zinc-900 border border-amber-500/50 px-2 py-1 text-right font-mono font-black text-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Tie-breaker rule: If two bids match, the older listing retains rank.
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-3.5 px-4 text-center text-sm font-black text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-98 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-zinc-950" />
                  <span>
                    Authorize Outbid & Claim Rank #{targetRank} ($
                    {(customBid ? parseFloat(customBid) : minNetPayable).toLocaleString()})
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-950" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
