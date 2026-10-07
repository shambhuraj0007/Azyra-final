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
  Layers, 
  TrendingUp, 
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

  const categories = ['All', 'AI & ML', 'DevTools', 'SaaS', 'Web3', 'Design', 'Productivity'];

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-zinc-900/60 p-2.5 border border-zinc-800/80 backdrop-blur-md">
        <div className="flex w-full sm:w-auto items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
          <button
            onClick={() => setBoard('all-time')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              board === 'all-time'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>All-Time Board</span>
            <span className="rounded-full bg-zinc-950/20 px-1.5 py-0.2 text-[10px] font-mono">
              Permanent
            </span>
          </button>

          <button
            onClick={() => setBoard('daily')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              board === 'daily'
                ? 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-400/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Today's Board (Daily)</span>
            <span className="rounded-full bg-zinc-950/20 px-1.5 py-0.2 text-[10px] font-mono">
              24h UTC
            </span>
          </button>
        </div>

        {/* Board description & UTC Reset Timer */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 px-3">
          {board === 'daily' ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-emerald-300">
              <Clock className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Next UTC Reset in:</span>
              <strong className="font-mono text-emerald-400 font-bold">{utcCountdown}</strong>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Cumulative lifetime spend • Listings never expire</span>
            </div>
          )}
        </div>
      </div>

      {/* TOP 3 PODIUM / SPOTLIGHT SHOWCASE */}
      {searchTerm === '' && selectedCategory === 'All' && sortedProducts.length >= 3 && (
        <div className="pt-4 pb-2">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              The Sovereign Heights
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Top 3 Financial Contenders
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Holding the most valuable product real estate on the internet through pure capital allocation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="order-2 md:order-1 relative rounded-2xl border border-zinc-700/80 bg-gradient-to-b from-zinc-800/70 to-zinc-900/90 p-5 shadow-xl transition-all hover:border-zinc-500 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-700/80 font-black text-zinc-100 text-sm ring-1 ring-zinc-500/40">
                      #2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Silver Medal
                    </span>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                    {top2.category}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    {top2.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white hover:text-amber-400 transition">
                      <a href={top2.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        {top2.name}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                      {top2.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-4 rounded-xl bg-zinc-950/80 p-3 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                      {board === 'all-time' ? 'Total Contributed' : 'Today Spent'}
                    </span>
                    <div className="text-xl font-mono font-black text-white">
                      ${(board === 'all-time' ? top2.allTimeSpend : top2.todaySpend).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    <div>{top2.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">Active</div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimRank(2, top2.url)}
                  className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-2 border border-zinc-600/50 shadow-md transition active:scale-98"
                >
                  <Coins className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Claim #2 (${getOvertakeCost(2).toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* Rank 1 (Gold / Crown) - Elevated Podium */}
            {top1 && (
              <div className="order-1 md:order-2 relative rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 p-6 shadow-2xl glow-gold transition-all hover:scale-[1.02] -translate-y-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-1 text-xs font-black text-zinc-950 shadow-lg shadow-amber-500/40">
                  <Crown className="h-3.5 w-3.5 fill-zinc-950" />
                  <span>REIGNING #1 KING</span>
                </div>

                <div className="flex items-center justify-between mb-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-black text-zinc-950 text-base shadow-md shadow-amber-500/30">
                      #1
                    </span>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        Gold Monarch
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Overtake requires +$5 min
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                    {top1.category}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="text-4xl p-2.5 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-inner">
                    {top1.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white hover:text-amber-300 transition">
                      <a href={top1.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        {top1.name}
                        <ExternalLink className="h-4 w-4 text-amber-400 opacity-80" />
                      </a>
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1 leading-relaxed">
                      {top1.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-4 rounded-2xl bg-zinc-950/90 p-3.5 border border-amber-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400/80">
                      {board === 'all-time' ? 'Dominant Capital Spent' : 'Today Spent'}
                    </span>
                    <div className="text-2xl font-mono font-black text-amber-400">
                      ${(board === 'all-time' ? top1.allTimeSpend : top1.todaySpend).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-300">
                    <div className="font-semibold text-white">
                      {top1.clicks?.toLocaleString() || 0} clicks
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Prime Exposure
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimRank(1, top1.url)}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black py-3 px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <Sparkles className="h-4 w-4 fill-zinc-950" />
                  <span>Claim #1 (${getOvertakeCost(1).toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="order-3 relative rounded-2xl border border-zinc-700/80 bg-gradient-to-b from-zinc-800/70 to-zinc-900/90 p-5 shadow-xl transition-all hover:border-zinc-500 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-900/60 font-black text-amber-200 text-sm ring-1 ring-amber-700/50">
                      #3
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200/80">
                      Bronze Medal
                    </span>
                  </div>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                    {top3.category}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                    {top3.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white hover:text-amber-400 transition">
                      <a href={top3.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        {top3.name}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                      {top3.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-4 rounded-xl bg-zinc-950/80 p-3 border border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                      {board === 'all-time' ? 'Total Contributed' : 'Today Spent'}
                    </span>
                    <div className="text-xl font-mono font-black text-white">
                      ${(board === 'all-time' ? top3.allTimeSpend : top3.todaySpend).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    <div>{top3.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">Active</div>
                  </div>
                </div>

                <button
                  onClick={() => onClaimRank(3, top3.url)}
                  className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-2 border border-zinc-600/50 shadow-md transition active:scale-98"
                >
                  <Coins className="h-3.5 w-3.5 text-zinc-300" />
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
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                    : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products, domains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* FULL LEADERBOARD TABLE / CARD LIST */}
      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Table header bar */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-zinc-900/70 border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Product & Value Proposition</div>
          <div className="col-span-2 text-right">
            {board === 'all-time' ? 'All-Time Spend' : 'Today Spend'}
          </div>
          <div className="col-span-2 text-center">Engagement</div>
          <div className="col-span-2 text-right">Overtake CTA</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/60">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No products match your filter.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              // Actual rank in the sorted list (1-indexed)
              const actualRank = sortedProducts.findIndex((p) => p.id === product.id) + 1;
              const spend = board === 'all-time' ? product.allTimeSpend : product.todaySpend;
              const overtakeCost = getOvertakeCost(actualRank);

              return (
                <div
                  key={product.id}
                  className={`group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 sm:px-6 py-4 items-center transition-colors hover:bg-zinc-900/50 ${
                    actualRank === 1 ? 'bg-amber-500/[0.03]' : ''
                  }`}
                >
                  {/* Rank Column */}
                  <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-sm font-black ${
                          actualRank === 1
                            ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                            : actualRank === 2
                            ? 'bg-zinc-300 text-zinc-950'
                            : actualRank === 3
                            ? 'bg-amber-800 text-amber-100'
                            : 'bg-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        {actualRank}
                      </span>
                    </div>

                    {/* Rank delta indicator */}
                    <div className="text-[10px] font-semibold flex items-center gap-0.5">
                      {product.rankDelta && product.rankDelta > 0 ? (
                        <span className="text-emerald-400 flex items-center">
                          <ArrowUp className="h-3 w-3" />+{product.rankDelta}
                        </span>
                      ) : product.rankDelta && product.rankDelta < 0 ? (
                        <span className="text-rose-400 flex items-center">
                          <ArrowDown className="h-3 w-3" />{product.rankDelta}
                        </span>
                      ) : (
                        <span className="text-zinc-600 flex items-center">
                          <Minus className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details Column */}
                  <div className="md:col-span-5 flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                      {product.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1.5 text-sm sm:text-base"
                        >
                          {product.name}
                          <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-amber-400" />
                        </a>
                        <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          {product.category}
                        </span>
                        {product.verified && (
                          <span title="Verified Sovereign Product">
                            <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {product.tagline}
                      </p>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 block truncate mt-0.5"
                      >
                        {product.url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>

                  {/* Financial Total Spend Column */}
                  <div className="md:col-span-2 flex md:flex-col justify-between items-center md:items-end">
                    <span className="text-xs text-zinc-500 md:hidden">
                      Total Contributed:
                    </span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-base sm:text-lg text-white">
                        ${spend.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {board === 'all-time'
                          ? `Today: $${product.todaySpend.toLocaleString()}`
                          : `All-Time: $${product.allTimeSpend.toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Engagement / Performance Column */}
                  <div className="md:col-span-2 hidden md:flex flex-col items-center justify-center text-xs text-zinc-400">
                    <span className="font-mono text-zinc-300">
                      {(product.clicks || 0).toLocaleString()} clicks
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      High CTR Tier
                    </span>
                  </div>

                  {/* CTA: Claim This Exact Rank Button */}
                  <div className="md:col-span-2 flex justify-end pt-2 md:pt-0">
                    <button
                      onClick={() => onClaimRank(actualRank, product.url)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 font-bold px-3.5 py-2 text-xs border border-zinc-700/80 hover:border-amber-400 transition-all shadow-sm active:scale-95 group/btn"
                    >
                      <Coins className="h-3.5 w-3.5 text-amber-400 group-hover/btn:text-zinc-950 transition" />
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
        <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Tie-Breaker Rule:</strong> If two products have the identical spend, the older listing retains the higher rank.
            </span>
          </div>
          <span className="text-zinc-500 font-mono">
            {products.length} Products Competing
          </span>
        </div>
      </div>
    </div>
  );
}
