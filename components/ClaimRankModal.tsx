'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Flame,
  Crown,
  TrendingUp,
  Zap,
  Building2,
  DollarSign,
  Layers,
} from 'lucide-react';
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

const LOGO_PRESETS = ['🚀', '⚡', '🤖', '🔮', '💎', '🔥', '🌐', '🧠', '🛠️', '✨'];

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

  const minNetPayable = bidCalculation.netPayable;
  const enteredAmount = customBid ? parseFloat(customBid) || minNetPayable : minNetPayable;
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
      productName: name.trim(),
      productUrl: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
      tagline: tagline.trim() || 'Next-generation tech & software',
      logo: logo || '🚀',
      category,
      bidAmount: enteredAmount,
      targetRank,
      isBump: !!existingProduct,
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleQuickAdd = (delta: number) => {
    const current = customBid ? parseFloat(customBid) || minNetPayable : minNetPayable;
    setCustomBid((current + delta).toString());
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="min-h-full flex items-start justify-center p-3 sm:p-6 py-6 sm:py-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl rounded-3xl border border-borderMuted bg-[#12181A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-5 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden my-auto"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-limeAccent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emeraldAccent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Highly Visible Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-2 bg-surfaceElevated hover:bg-[#223033] text-textMuted hover:text-white border border-borderMuted shadow-lg transition-colors z-30 flex items-center justify-center group"
          >
            <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>

        {submitted ? (
          <div className="py-14 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emeraldAccent/20 text-emeraldAccent border border-emeraldAccent/40 shadow-lg shadow-emeraldAccent/10 animate-in zoom-in-50 duration-300">
              <CheckCircle className="h-9 w-9" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-textMain tracking-tight">
                Position Claimed Successfully!
              </h3>
              <p className="text-xs font-mono text-emerald-400 mt-1">
                Transaction Settled on Leaderboard Ledger
              </p>
            </div>
            <p className="text-sm text-textMuted max-w-md mx-auto leading-relaxed">
              <strong className="text-limeAccent font-heading">{name}</strong> is now locked into{' '}
              <strong className="text-textMain font-mono font-bold bg-surfaceElevated px-2 py-0.5 rounded border border-borderMuted">
                Rank #{targetRank}
              </strong>{' '}
              on the {board === 'all-time' ? 'All-Time' : 'Today'} board.
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">

            {/* HEADER */}
            <div className="flex items-start gap-4 pr-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-limeAccent to-emeraldAccent text-[#0B0F10] font-heading font-bold shadow-lg shadow-limeAccent/20 shrink-0">
                {isTargetingNumberOne ? (
                  <Crown className="h-6 w-6 fill-[#0B0F10]" />
                ) : (
                  <TrendingUp className="h-6 w-6 stroke-[2.5]" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-textMain">
                    Claim Position #{targetRank}
                  </h2>
                  <span className="rounded-full bg-surfaceElevated px-2.5 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-borderMuted uppercase tracking-wider">
                    {board === 'all-time' ? 'All-Time Leaderboard' : 'Daily Sprint'}
                  </span>
                </div>
                <p className="text-xs text-textMuted mt-1">
                  Capital-weighted sovereign ranking. Real-time escrow settlement with instant board placement.
                </p>
              </div>
            </div>

            {/* POSITION SELECTOR & TARGET HOLDER DOSSIER */}
            <div className="rounded-2xl bg-canvas/80 border border-borderMuted p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-textMuted font-bold">
                  Select Target Rank
                </span>
                <span className="text-[10px] font-mono text-limeAccent">
                  {isTargetingNumberOne ? '👑 Pinnacle Spot' : `Outbidding Rank #${targetRank}`}
                </span>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5, 8, 10].map((rk) => (
                  <button
                    key={rk}
                    type="button"
                    onClick={() => {
                      setTargetRank(rk);
                      setCustomBid('');
                    }}
                    className={`rounded-xl px-3.5 py-2 text-xs font-heading font-bold transition flex items-center gap-1.5 ${
                      targetRank === rk
                        ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/25 font-black scale-105'
                        : 'bg-surfaceElevated text-textMuted hover:text-textMain hover:border-limeAccent/40 border border-borderMuted'
                    }`}
                  >
                    <span>#{rk}</span>
                    {rk === 1 && <span>👑</span>}
                  </button>
                ))}

                <div className="flex items-center gap-1.5 ml-auto bg-surfaceElevated px-3 py-1.5 rounded-xl border border-borderMuted">
                  <span className="text-xs text-textMuted font-mono">Custom #</span>
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
                    className="w-12 bg-transparent text-xs text-textMain text-center font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Holder Intel */}
              {currentHolder && (
                <div className="pt-2 border-t border-borderMuted/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-textMuted">Occupant:</span>
                    <span className="text-textMain font-bold bg-surfaceElevated px-2 py-0.5 rounded border border-borderMuted">
                      {currentHolder.logo} {currentHolder.name}
                    </span>
                    <span className="text-[10px] text-textMuted">({currentHolder.category})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-textMuted">Their Benchmark:</span>
                    <span className="text-limeAccent font-bold">
                      ${(board === 'all-time' ? currentHolder.allTimeSpend : currentHolder.todaySpend).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Website URL */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5 flex items-center justify-between">
                  <span>Product Website URL *</span>
                  <span className="text-[10px] font-mono text-textMuted lowercase">links directly to your product</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="https://yourproduct.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-surfaceElevated border border-borderMuted rounded-xl pl-10 pr-4 py-2.5 text-xs text-textMain placeholder:text-textMuted/50 focus:border-limeAccent outline-none font-mono transition"
                  />
                </div>
              </div>

              {/* Existing Product Recognition Notice (Bump mechanic) */}
              {existingProduct ? (
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/40 p-4 flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-heading font-bold text-emerald-300">
                      Existing Listing Recognized: {existingProduct.name}
                    </div>
                    <p className="text-emerald-200/80 mt-0.5 leading-relaxed">
                      You already have <strong className="font-mono text-emerald-300">${bidCalculation.existingSpend.toLocaleString()}</strong> in cumulative spend. Under the Bump Protocol rule, you only pay the incremental delta to claim Rank #{targetRank}!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Studio"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-2.5 text-xs text-textMain placeholder:text-textMuted/50 focus:border-limeAccent outline-none transition"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5">
                      Industry Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-3.5 py-2.5 text-xs text-textMain focus:border-limeAccent outline-none transition"
                    >
                      <option value="AI & ML">AI & ML</option>
                      <option value="DevTools">DevTools</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Web3">Web3</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Design">Design</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Marketing">Marketing</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Tagline */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5">
                      Tagline / Value Proposition
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The fastest autonomous agentic compiler for modern software"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full bg-surfaceElevated border border-borderMuted rounded-xl px-4 py-2.5 text-xs text-textMain placeholder:text-textMuted/50 focus:border-limeAccent outline-none transition"
                    />
                  </div>

                  {/* Brand Icon Selector */}
                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-textMuted">Icon:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {LOGO_PRESETS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setLogo(ic)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition ${
                            logo === ic
                              ? 'bg-limeAccent/20 border-limeAccent text-textMain'
                              : 'bg-surfaceElevated border-borderMuted text-textMuted hover:text-textMain'
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CAPITAL CALCULATION LEDGER CARD */}
              <div className="rounded-2xl bg-canvas/90 border border-borderMuted p-4 sm:p-5 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs font-heading font-bold">
                  <span className="text-limeAccent uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Capital Settlement Ledger
                  </span>
                  {isTargetingNumberOne && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                      <Flame className="h-3 w-3 fill-amber-400" />
                      +$5 Minimum Outbid
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-textMuted pt-1 border-t border-borderMuted/60">
                  <div className="flex justify-between items-center">
                    <span>Rank #{targetRank} Required Benchmark:</span>
                    <span className="text-textMain font-bold">
                      ${bidCalculation.targetSpendRequired.toLocaleString()}
                    </span>
                  </div>

                  {existingProduct && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>Prior Contribution Credit (Bump Rule):</span>
                      <span className="font-bold">
                        -${bidCalculation.existingSpend.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-borderMuted flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-textMain font-heading font-bold text-sm block">
                        Net Settlement to Claim:
                      </span>
                      <span className="text-[10px] text-textMuted">
                        Min. required: ${minNetPayable.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-surfaceElevated px-3 py-1.5 rounded-xl border border-limeAccent/60 focus-within:ring-1 focus-within:ring-limeAccent">
                        <span className="text-xs text-textMuted font-mono mr-1">$</span>
                        <input
                          type="number"
                          min={minNetPayable}
                          value={customBid === '' ? minNetPayable : customBid}
                          onChange={(e) => setCustomBid(e.target.value)}
                          className="w-24 bg-transparent text-right font-mono font-bold text-limeAccent text-base focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Bid Increments */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <span className="text-[10px] text-textMuted mr-1">Boost:</span>
                    {[10, 50, 100, 500].map((boost) => (
                      <button
                        key={boost}
                        type="button"
                        onClick={() => handleQuickAdd(boost)}
                        className="px-2 py-0.5 rounded-md bg-surfaceElevated hover:bg-surface hover:text-limeAccent text-[10px] text-textMuted border border-borderMuted transition"
                      >
                        +${boost}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-borderMuted/60 flex items-center gap-2 text-[11px] text-textMuted">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    Deterministic Protocol Rule: If identical bids occur, the earlier timestamp retains seniority.
                  </span>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-limeAccent to-emeraldAccent py-3.5 px-6 text-center text-sm font-heading font-bold text-[#0B0F10] shadow-xl shadow-limeAccent/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2.5 group"
                >
                  <Sparkles className="h-4 w-4 text-[#0B0F10]" />
                  <span>
                    Authorize Outbid & Claim Rank #{targetRank} ($
                    {(customBid ? parseFloat(customBid) || minNetPayable : minNetPayable).toLocaleString()})
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#0B0F10] group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] font-mono text-center text-textMuted mt-2">
                  Immediate Settlement • Escrow Secured
                </p>
              </div>

            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
