'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Flame,
  ExternalLink,
  Search,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Coins,
  ShieldCheck,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { ProductEntry, BoardType } from '../lib/types';
import { sortLeaderboard, calculateRequiredBid } from '../lib/data';

interface LeaderboardProps {
  products: ProductEntry[];
  board: BoardType;
  setBoard: (b: BoardType) => void;
  onClaimRank: (targetRank: number, productUrl?: string) => void;
}

export default function Leaderboard({
  products,
  board,
  setBoard,
  onClaimRank,
}: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [utcCountdown, setUtcCountdown] = useState<string>('00:00:00');

  // UTC countdown timer until 00:00:00 UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextUtcMidnight = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0
        )
      );
      const diffMs = nextUtcMidnight.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setUtcCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sorted strictly by financial hierarchy with tie-breaker rule
  const sortedProducts = useMemo(() => {
    return sortLeaderboard(products, board);
  }, [products, board]);

  // Filtered by search and category
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedProducts, searchTerm, selectedCategory]);

  const categories = [
    'All',
    'AI & ML',
    'DevTools',
    'SaaS',
    'Web3',
    'Crypto',
    'Fintech',
    'Design',
    'Productivity',
    'Gaming',
    'Marketing',
    'E-commerce',
    'Mobile',
    'Others',
  ];

  // Top 3 for Podium
  const top1 = sortedProducts[0];
  const top2 = sortedProducts[1];
  const top3 = sortedProducts[2];

  // Helper to get exact overtake cost for any spot
  const getOvertakeCost = (rank: number) => {
    const calc = calculateRequiredBid({
      targetRank: rank,
      sortedProducts,
      board,
    });
    return calc.targetSpendRequired;
  };

  return (
    <div className="space-y-8">
      {/* Board Selector Tabs & Daily UTC Countdown Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-surface p-2.5 border border-borderMuted">
        <div className="flex w-full sm:w-auto items-center gap-1.5 p-1 bg-surfaceElevated rounded-xl border border-borderMuted">
          <button
            onClick={() => setBoard('all-time')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-heading font-bold transition-all ${board === 'all-time'
                ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20'
                : 'text-textMuted hover:text-textMain hover:bg-surface'
              }`}
          >
            <Trophy className="h-4 w-4" />
            <span>All-Time Board</span>
            <span className="rounded-full bg-[#0B0F10]/20 px-1.5 py-0.2 text-[10px] font-mono">
              Permanent
            </span>
          </button>

          <button
            onClick={() => setBoard('daily')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-heading font-bold transition-all ${board === 'daily'
                ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20'
                : 'text-textMuted hover:text-textMain hover:bg-surface'
              }`}
          >
            <Flame className="h-4 w-4" />
            <span>Today's Board (Daily)</span>
            <span className="rounded-full bg-[#0B0F10]/20 px-1.5 py-0.2 text-[10px] font-mono">
              24h UTC
            </span>
          </button>
        </div>

        {/* Board description & UTC Reset Timer */}
        <div className="flex items-center gap-3 text-xs text-textMuted px-3">
          {board === 'daily' ? (
            <div className="flex items-center gap-2 rounded-lg bg-emeraldAccent/10 border border-emeraldAccent/30 px-3 py-1.5 text-emeraldAccent">
              <Clock className="h-4 w-4 text-emeraldAccent animate-spin" style={{ animationDuration: '8s' }} />
              <span>Next UTC Reset in:</span>
              <strong className="font-mono text-emeraldAccent font-bold">{utcCountdown}</strong>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-textMuted">
              <Calendar className="h-3.5 w-3.5 text-limeAccent" />
              <span>Cumulative lifetime spend • Listings never expire</span>
            </div>
          )}
        </div>
      </div>

      {/* TOP 3 PODIUM / SPOTLIGHT SHOWCASE */}
      {searchTerm === '' && selectedCategory === 'All' && sortedProducts.length >= 3 && (
        <div className="pt-4 pb-2">
          <div className="text-center mb-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-limeAccent">
              The Sovereign Heights
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-textMain tracking-tight mt-1">
              Top 3 Financial Contenders
            </h2>
            <p className="text-xs text-textMuted mt-1 max-w-md mx-auto">
              Holding the most valuable product real estate on the internet through pure capital allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="order-2 md:order-1 relative rounded-2xl border border-borderMuted bg-surface p-5 shadow-xl transition-all hover:border-limeAccent/40 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surfaceElevated font-mono font-black text-textMain text-sm ring-1 ring-borderMuted">
                      #2
                    </span>
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-textMuted">
                      Silver
                    </span>
                  </div>
                  <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[11px] font-mono font-semibold text-textMuted border border-borderMuted">
                    {top2.category}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl p-2 rounded-xl bg-surfaceElevated border border-borderMuted">
                    {top2.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-black text-textMain hover:text-limeAccent transition">
                      <a href={top2.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        {top2.name}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    </h3>
                    <p className="text-xs text-textMuted line-clamp-2 mt-0.5">
                      {top2.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-4 rounded-xl bg-surfaceElevated p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-textMuted">
                      {board === 'all-time' ? 'Total Contributed' : 'Today Spent'}
                    </span>
                    <div className="text-xl font-mono font-black text-textMain">
                      ${(board === 'all-time' ? top2.allTimeSpend : top2.todaySpend).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-textMuted">
                    <div className="font-mono">{top2.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[10px] text-emeraldAccent font-semibold">Active</div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimRank(2, top2.url)}
                  className="w-full rounded-xl bg-surfaceElevated hover:bg-surface text-textMain hover:border-limeAccent font-heading font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-2 border border-borderMuted shadow-md transition active:scale-[0.98]"
                >
                  <Coins className="h-3.5 w-3.5 text-textMuted" />
                  <span>Claim #2 (${getOvertakeCost(2).toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* Rank 1 (Electric Lime Monarch) - Elevated Podium */}
            {top1 && (
              <div className="order-1 md:order-2 relative rounded-3xl border-2 border-limeAccent bg-gradient-to-b from-limeAccent/10 via-surface to-surface p-6 shadow-2xl glow-lime transition-all hover:scale-[1.02] -translate-y-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-limeAccent px-4 py-1 text-xs font-heading font-black text-[#0B0F10] shadow-lg shadow-limeAccent/40">
                  <Crown className="h-3.5 w-3.5 fill-[#0B0F10]" />
                  <span>REIGNING #1 KING</span>
                </div>

                <div className="flex items-center justify-between mb-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-limeAccent font-heading font-black text-[#0B0F10] text-base shadow-md shadow-limeAccent/30">
                      #1
                    </span>
                    <div>
                      <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-limeAccent flex items-center gap-1">
                        Lime Monarch
                      </span>
                      <span className="text-[10px] text-textMuted font-mono">
                        Overtake requires +$5 min
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-limeAccent/15 px-2.5 py-0.5 text-xs font-mono font-bold text-limeAccent border border-limeAccent/30">
                    {top1.category}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="text-4xl p-2.5 rounded-2xl bg-surfaceElevated border border-limeAccent/40 shadow-inner">
                    {top1.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-black text-textMain hover:text-limeAccent transition">
                      <a href={top1.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        {top1.name}
                        <ExternalLink className="h-4 w-4 text-limeAccent opacity-80" />
                      </a>
                    </h3>
                    <p className="text-xs text-textMuted line-clamp-2 mt-1 leading-relaxed">
                      {top1.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-4 rounded-2xl bg-surfaceElevated p-3.5 border border-limeAccent/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-limeAccent/90">
                      {board === 'all-time' ? 'Dominant Capital Spent' : 'Today Spent'}
                    </span>
                    <div className="text-2xl font-mono font-black text-limeAccent">
                      ${(board === 'all-time' ? top1.allTimeSpend : top1.todaySpend).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-textMuted">
                    <div className="font-mono font-semibold text-textMain">
                      {top1.clicks?.toLocaleString() || 0} clicks
                    </div>
                    <div className="text-[10px] text-emeraldAccent font-mono font-bold flex items-center gap-1 justify-end">
                      <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent animate-pulse"></span>
                      Prime Spot
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimRank(1, top1.url)}
                  className="w-full rounded-2xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-black py-3 px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 fill-[#0B0F10]" />
                  <span>Claim #1 (${getOvertakeCost(1).toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="order-3 relative rounded-2xl border border-borderMuted bg-surface p-5 shadow-xl transition-all hover:border-limeAccent/40 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surfaceElevated font-mono font-black text-textMain text-sm ring-1 ring-borderMuted">
                      #3
                    </span>
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-textMuted">
                      Bronze
                    </span>
                  </div>
                  <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[11px] font-mono font-semibold text-textMuted border border-borderMuted">
                    {top3.category}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl p-2 rounded-xl bg-surfaceElevated border border-borderMuted">
                    {top3.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-black text-textMain hover:text-limeAccent transition">
                      <a href={top3.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        {top3.name}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    </h3>
                    <p className="text-xs text-textMuted line-clamp-2 mt-0.5">
                      {top3.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-4 rounded-xl bg-surfaceElevated p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-semibold text-textMuted">
                      {board === 'all-time' ? 'Total Contributed' : 'Today Spent'}
                    </span>
                    <div className="text-xl font-mono font-black text-textMain">
                      ${(board === 'all-time' ? top3.allTimeSpend : top3.todaySpend).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-textMuted">
                    <div className="font-mono">{top3.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[10px] text-emeraldAccent font-semibold">Active</div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimRank(3, top3.url)}
                  className="w-full rounded-xl bg-surfaceElevated hover:bg-surface text-textMain hover:border-limeAccent font-heading font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-2 border border-borderMuted shadow-md transition active:scale-[0.98]"
                >
                  <Coins className="h-3.5 w-3.5 text-textMuted" />
                  <span>Claim #3 (${getOvertakeCost(3).toLocaleString()})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILTER BAR: SEARCH & CATEGORY PILLS */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-heading transition ${selectedCategory === cat
                    ? 'bg-limeAccent text-[#0B0F10] font-bold shadow-md shadow-limeAccent/20'
                    : 'bg-surface text-textMuted hover:bg-surfaceElevated hover:text-textMain border border-borderMuted'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search products, domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-surface border border-borderMuted pl-9 pr-4 py-2 text-xs text-textMain placeholder:text-textMuted focus:border-limeAccent focus:ring-1 focus:ring-limeAccent outline-none font-sans"
            />
          </div>
        </div>
      </div>

      {/* FULL LEADERBOARD TABLE / CARD LIST */}
      <div className="rounded-2xl border border-borderMuted bg-surface overflow-hidden shadow-2xl">
        {/* Table header bar */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-surfaceElevated/70 border-b border-borderMuted text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 font-heading">Product & Pitch</div>
          <div className="col-span-2 text-right">
            {board === 'all-time' ? 'All-Time Spend' : 'Today Spend'}
          </div>
          <div className="col-span-2 text-center">Engagement</div>
          <div className="col-span-2 text-right">Overtake CTA</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-borderMuted">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-textMuted">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No products match your filter.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const actualRank = sortedProducts.findIndex((p) => p.id === product.id) + 1;
              const spend = board === 'all-time' ? product.allTimeSpend : product.todaySpend;
              const overtakeCost = getOvertakeCost(actualRank);

              return (
                <div
                  key={product.id}
                  className={`group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 sm:px-6 py-4 items-center transition-colors hover:bg-surfaceElevated/40 ${actualRank === 1 ? 'bg-limeAccent/[0.04]' : ''
                    }`}
                >
                  {/* Rank Column */}
                  <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-sm font-black ${actualRank === 1
                            ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20'
                            : actualRank === 2
                              ? 'bg-surfaceElevated text-textMain border border-borderMuted'
                              : actualRank === 3
                                ? 'bg-surfaceElevated text-textMain border border-borderMuted'
                                : 'bg-surfaceElevated/60 text-textMuted'
                          }`}
                      >
                        {actualRank}
                      </span>
                    </div>

                    {/* Rank delta indicator */}
                    <div className="text-[10px] font-mono font-semibold flex items-center gap-0.5">
                      {product.rankDelta && product.rankDelta > 0 ? (
                        <span className="text-emeraldAccent flex items-center">
                          <ArrowUp className="h-3 w-3" />+{product.rankDelta}
                        </span>
                      ) : product.rankDelta && product.rankDelta < 0 ? (
                        <span className="text-rose-400 flex items-center">
                          <ArrowDown className="h-3 w-3" />{product.rankDelta}
                        </span>
                      ) : (
                        <span className="text-textMuted/60 flex items-center">
                          <Minus className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details Column */}
                  <div className="md:col-span-5 flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-surfaceElevated border border-borderMuted shrink-0">
                      {product.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-heading font-bold text-textMain group-hover:text-limeAccent transition flex items-center gap-1.5 text-sm sm:text-base"
                        >
                          {product.name}
                          <ExternalLink className="h-3 w-3 text-textMuted group-hover:text-limeAccent" />
                        </a>
                        <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[10px] font-mono font-medium text-textMuted border border-borderMuted">
                          {product.category}
                        </span>
                        {product.verified && (
                          <span title="Verified Sovereign Product">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emeraldAccent" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-textMuted line-clamp-1 mt-0.5">
                        {product.tagline}
                      </p>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-textMuted/70 hover:text-textMain block truncate mt-0.5"
                      >
                        {product.url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>

                  {/* Financial Total Spend Column */}
                  <div className="md:col-span-2 flex md:flex-col justify-between items-center md:items-end">
                    <span className="text-xs text-textMuted md:hidden">
                      Total Contributed:
                    </span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-base sm:text-lg text-textMain">
                        ${spend.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-textMuted">
                        {board === 'all-time'
                          ? `Today: $${product.todaySpend.toLocaleString()}`
                          : `All-Time: $${product.allTimeSpend.toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Engagement / Performance Column */}
                  <div className="md:col-span-2 hidden md:flex flex-col items-center justify-center text-xs text-textMuted">
                    <span className="font-mono text-textMain">
                      {(product.clicks || 0).toLocaleString()} clicks
                    </span>
                    <span className="text-[10px] font-mono text-textMuted/80">
                      Tier 1 CTR
                    </span>
                  </div>

                  {/* CTA: Claim This Exact Rank Button */}
                  <div className="md:col-span-2 flex justify-end pt-2 md:pt-0">
                    <button
                      onClick={() => onClaimRank(actualRank, product.url)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-surfaceElevated hover:bg-limeAccent hover:text-[#0B0F10] text-textMain font-mono font-bold px-3.5 py-2 text-xs border border-borderMuted hover:border-limeAccent transition-all shadow-sm active:scale-[0.98] group/btn"
                    >
                      <Coins className="h-3.5 w-3.5 text-limeAccent group-hover/btn:text-[#0B0F10] transition" />
                      <span>
                        Claim #{actualRank} (${overtakeCost.toLocaleString()})
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tie Breaker Footer Notice */}
        <div className="border-t border-borderMuted bg-surfaceElevated/40 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-textMuted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emeraldAccent shrink-0" />
            <span>
              <strong>Tie-Breaker Rule:</strong> If two products have identical spend, the older listing retains the higher rank.
            </span>
          </div>
          <span className="text-textMuted font-mono">
            {products.length} Products Competing
          </span>
        </div>
      </div>
    </div>
  );
}
