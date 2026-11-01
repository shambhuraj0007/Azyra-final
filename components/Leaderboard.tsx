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
  CheckCircle2,
  Check,
  Globe,
  Zap,
  ArrowRight,
  Plus,
  Shield,
  Layers,
} from 'lucide-react';
import { ProductEntry, BoardType } from '../lib/types';
import { sortLeaderboard, calculateRequiredBid, extractDomain, inferStartupName, calculateProductTodaySpend, isPaymentToday } from '../lib/data';
import FaviconImage from './FaviconImage';

interface LeaderboardProps {
  products: ProductEntry[];
  board: BoardType;
  setBoard: (b: BoardType) => void;
  onClaimRank: (targetRank: number, productUrl?: string, productName?: string) => void;
  userStartupUrls?: string[];
  onAddUserStartup?: (url: string) => void;
  onTrackClick?: (product: ProductEntry) => void;
}

export default function Leaderboard({
  products,
  board,
  setBoard,
  onClaimRank,
  userStartupUrls = [],
  onAddUserStartup,
  onTrackClick,
}: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [utcCountdown, setUtcCountdown] = useState<string>('00:00:00');

  // User startup tracking
  const [userStartups, setUserStartups] = useState<string[]>(userStartupUrls);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickBrowserTitle, setQuickBrowserTitle] = useState('');
  const [quickTargetRank, setQuickTargetRank] = useState(1);
  const [customRankInput, setCustomRankInput] = useState<string>('');
  const [isQuickBarOpen, setIsQuickBarOpen] = useState(true);

  // Automatically fetch browser title for quick link input
  useEffect(() => {
    const clean = quickUrl.trim();
    if (!clean || !clean.includes('.') || clean.length < 4) {
      setQuickBrowserTitle('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.success && data.title) {
          setQuickBrowserTitle(data.title);
        }
      } catch (e) {
        console.error(e);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [quickUrl]);

  // Sync with localStorage on mount & listen for updates
  useEffect(() => {
    try {
      const stored = localStorage.getItem('azyra_user_startups');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUserStartups((prev) => Array.from(new Set([...prev, ...parsed])));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Update when parent prop changes
  useEffect(() => {
    if (userStartupUrls && userStartupUrls.length > 0) {
      setUserStartups((prev) => Array.from(new Set([...prev, ...userStartupUrls])));
    }
  }, [userStartupUrls]);

  // Helper to check if a URL belongs to the user
  const isUserStartup = (url: string): boolean => {
    if (!url) return false;
    const targetDomain = extractDomain(url);
    if (!targetDomain) return false;
    return userStartups.some((userUrl) => extractDomain(userUrl) === targetDomain);
  };

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

  const sortedProducts = useMemo(() => {
    return sortLeaderboard(products, board);
  }, [products, board]);

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

  const top1 = sortedProducts[0];
  const top2 = sortedProducts[1];
  const top3 = sortedProducts[2];

  const getOvertakeCost = (targetRank: number): number => {
    return calculateRequiredBid({
      targetRank,
      sortedProducts,
      board,
    }).netPayable;
  };

  const handleCardClick = (product: ProductEntry) => {
    if (onTrackClick) {
      onTrackClick(product);
    }
    const cleanUrl = product.url.startsWith('http') ? product.url : `https://${product.url}`;
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  };

  const quickDomain = extractDomain(quickUrl);
  const inferredQuickName = inferStartupName(quickUrl);

  const quickCalc = useMemo(() => {
    return calculateRequiredBid({
      targetRank: quickTargetRank,
      sortedProducts,
      board,
      existingProductUrl: quickUrl.trim() || undefined,
    });
  }, [quickUrl, quickTargetRank, board, sortedProducts]);

  const handleQuickClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;

    if (onAddUserStartup) {
      onAddUserStartup(quickUrl.trim());
    }

    setUserStartups((prev) => {
      const updated = Array.from(new Set([...prev, quickUrl.trim()]));
      try {
        localStorage.setItem('azyra_user_startups', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });

    onClaimRank(quickTargetRank, quickUrl.trim(), quickBrowserTitle || inferredQuickName || '');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ----------------- SECTION 1: HEADER CONTROLS & BOARD SELECTOR ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/90 border border-borderMuted rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-xl backdrop-blur-xl">
        {/* Board Toggle: All-Time vs Today */}
        <div className="flex items-center gap-1.5 bg-canvas/80 p-1 rounded-xl border border-borderMuted self-start sm:self-auto">
          <button
            onClick={() => setBoard('all-time')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${board === 'all-time'
              ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20 font-black'
              : 'text-textMuted hover:text-textMain'
              }`}
          >
            All-Time Dominance
          </button>
          <button
            onClick={() => setBoard('daily')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all flex items-center gap-1.5 ${board === 'daily'
              ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20 font-black'
              : 'text-textMuted hover:text-textMain'
              }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Today&apos;s Race</span>
          </button>
        </div>

        {/* Live Info: UTC Reset Countdown & Total Volume */}
        <div className="flex items-center gap-4 text-xs font-mono text-textMuted">
          {board === 'daily' ? (
            <div className="flex items-center gap-1.5 text-limeAccent font-medium bg-limeAccent/10 px-2.5 py-1 rounded-lg border border-limeAccent/20">
              <Clock className="h-3.5 w-3.5 text-limeAccent" />
              <span>Resets in: <strong className="font-bold tabular-nums">{utcCountdown}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-textMuted">
              <span className="h-2 w-2 rounded-full bg-emeraldAccent animate-pulse" />
              <span>Real-Time Escrow Direct Bidding</span>
            </div>
          )}
        </div>
      </div>

      {/* ----------------- SECTION 2: TOP 3 SOVEREIGN PODIUM (Clean Minimal Fintech) ----------------- */}
      {selectedCategory === 'All' && !searchTerm && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-textMuted font-semibold flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-limeAccent" />
              <span>Sovereign Top 3 Listings</span>
            </h2>
            <span className="text-[11px] font-mono text-textMuted">Ties resolved by listing timestamp</span>
          </div>

          {/* Podium Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-end">

            {/* ----------------- RANK 2 (SILVER GLASS) ----------------- */}
            {top2 && (
              <div
                id="rank-2"
                onClick={() => handleCardClick(top2)}
                className={`order-2 md:order-1 card-premium p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isUserStartup(top2.url)
                  ? 'border-limeAccent ring-2 ring-limeAccent/50'
                  : 'hover:border-slate-300/40'
                  }`}
              >
                {/* User Badge */}
                {isUserStartup(top2.url) && (
                  <div className="absolute -top-3 right-4 z-20 flex items-center gap-1 rounded-full bg-limeAccent px-2.5 py-0.5 text-[9px] font-heading font-black text-[#0B0F10] shadow-md shadow-limeAccent/30 animate-pulse">
                    <Sparkles className="h-2.5 w-2.5 fill-[#0B0F10]" />
                    <span>YOUR STARTUP</span>
                  </div>
                )}

                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-surfaceElevated font-mono font-bold text-textMain text-xs border border-borderMuted">
                      #2
                    </span>
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-300">
                      Silver
                    </span>
                  </div>
                  <span className="rounded-full bg-surfaceElevated px-2.5 py-0.5 text-[9px] font-mono font-semibold text-textMuted border border-borderMuted">
                    {top2.category}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-1.5 rounded-xl bg-canvas border border-borderMuted shrink-0">
                    <FaviconImage url={top2.url} fallback={top2.logo} className="w-7 h-7 rounded-lg" size={128} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-heading font-bold text-textMain hover:text-limeAccent transition truncate">
                      <a href={top2.url} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(top2); }} className="inline-flex items-center gap-1.5 cursor-pointer">
                        {top2.name}
                        <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                      </a>
                    </h3>
                    <p className="text-[11px] text-textMuted line-clamp-1 mt-0.5 leading-snug">
                      {top2.tagline}
                    </p>
                  </div>
                </div>

                {/* Stats Box */}
                <div className="my-3 rounded-xl bg-canvas/60 p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider font-semibold text-textMuted block mb-0.5">
                      {board === 'all-time' ? 'Total Paid Amount' : "Today's Payment (UTC)"}
                    </span>
                    <div className="text-base sm:text-lg font-mono font-bold text-textMain tracking-tight tabular-nums">
                      ${(board === 'all-time' ? top2.allTimeSpend : calculateProductTodaySpend(top2)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-mono text-textMuted font-medium tabular-nums">{top2.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[9px] text-emeraldAccent font-semibold mt-0.5 flex items-center gap-1 justify-end">
                      <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(2, top2.url, top2.name); }}
                  className={`w-full rounded-xl font-heading font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 border transition-all duration-200 active:scale-[0.98] cursor-pointer ${isUserStartup(top2.url)
                    ? 'bg-limeAccent text-[#0B0F10] border-limeAccent hover:brightness-110 font-black shadow-md shadow-limeAccent/20'
                    : 'bg-surfaceElevated hover:bg-surface text-textMain border-borderMuted hover:border-limeAccent/50'
                    }`}
                >
                  {isUserStartup(top2.url) ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0B0F10]" />
                      <span>Defend Rank #2 (${getOvertakeCost(2).toLocaleString()})</span>
                    </>
                  ) : (
                    <>
                      <Coins className="h-3.5 w-3.5 text-textMuted" />
                      <span>Claim #2 (${getOvertakeCost(2).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ----------------- RANK 1 (ELECTRIC LIME MONARCH) ----------------- */}
            {top1 && (
              <div
                id="rank-1"
                onClick={() => handleCardClick(top1)}
                className={`order-1 md:order-2 relative rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.01] -translate-y-1 bg-surface border-2 border-limeAccent/80 shadow-[0_0_36px_rgba(212,246,60,0.18)] cursor-pointer hover:shadow-[0_0_46px_rgba(212,246,60,0.28)] ${isUserStartup(top1.url)
                  ? 'border-limeAccent ring-4 ring-limeAccent/40'
                  : ''
                  }`}
              >
                {/* King Crown Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-limeAccent px-3.5 py-0.5 text-[10px] font-heading font-extrabold text-[#0B0F10] shadow-md shadow-limeAccent/40 border border-limeAccent whitespace-nowrap">
                  <Crown className="h-3.5 w-3.5 fill-[#0B0F10]" />
                  <span>{isUserStartup(top1.url) ? 'YOUR REIGNING #1 LISTING' : 'REIGNING #1 KING'}</span>
                </div>

                {/* Header Row */}
                <div className="flex items-center justify-between mb-3 pt-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-limeAccent font-heading font-black text-[#0B0F10] text-sm shadow-md shadow-limeAccent/30">
                      #1
                    </span>
                    <div>
                      <span className="text-[11px] font-heading font-black uppercase tracking-wider text-limeAccent flex items-center gap-1">
                        Lime Monarch
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-limeAccent/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/30">
                    {top1.category}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-canvas border border-limeAccent/40 shrink-0">
                    <FaviconImage url={top1.url} fallback={top1.logo} className="w-8 h-8 rounded-lg" size={128} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-heading font-black text-textMain hover:text-limeAccent transition truncate">
                      <a href={top1.url} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(top1); }} className="inline-flex items-center gap-1.5 cursor-pointer">
                        {top1.name}
                        <ExternalLink className="h-3.5 w-3.5 text-limeAccent opacity-80 shrink-0" />
                      </a>
                    </h3>
                    <p className="text-[11px] text-textMuted line-clamp-1 mt-0.5 leading-snug">
                      {top1.tagline}
                    </p>
                  </div>
                </div>

                {/* Highlight Stats Box */}
                <div className="my-3 rounded-xl bg-canvas/80 p-3 border border-limeAccent/30 flex justify-between items-center">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-widest font-bold text-limeAccent/90 block mb-0.5">
                      {board === 'all-time' ? 'Dominant Paid Amount' : "Today's Payment (UTC)"}
                    </span>
                    <div className="text-lg sm:text-xl font-mono font-bold text-limeAccent tracking-tight tabular-nums">
                      ${(board === 'all-time' ? top1.allTimeSpend : calculateProductTodaySpend(top1)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-mono font-bold text-textMain tabular-nums">
                      {top1.clicks?.toLocaleString() || 0} clicks
                    </div>
                    <div className="text-[9px] text-emeraldAccent font-mono font-bold flex items-center gap-1 justify-end mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent animate-pulse" />
                      Prime Spot
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(1, top1.url, top1.name); }}
                  className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-black py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-limeAccent/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  {isUserStartup(top1.url) ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 fill-[#0B0F10]" />
                      <span>Defend Sovereign #1 (${getOvertakeCost(1).toLocaleString()})</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 fill-[#0B0F10]" />
                      <span>Claim #1 (${getOvertakeCost(1).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ----------------- RANK 3 (BRONZE GLASS) ----------------- */}
            {top3 && (
              <div
                id="rank-3"
                onClick={() => handleCardClick(top3)}
                className={`order-3 card-premium p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isUserStartup(top3.url)
                  ? 'border-limeAccent ring-2 ring-limeAccent/50'
                  : 'hover:border-amber-500/40'
                  }`}
              >
                {/* User Badge */}
                {isUserStartup(top3.url) && (
                  <div className="absolute -top-3 right-4 z-20 flex items-center gap-1 rounded-full bg-limeAccent px-2.5 py-0.5 text-[9px] font-heading font-black text-[#0B0F10] shadow-md shadow-limeAccent/30 animate-pulse">
                    <Sparkles className="h-2.5 w-2.5 fill-[#0B0F10]" />
                    <span>YOUR STARTUP</span>
                  </div>
                )}

                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-surfaceElevated font-mono font-bold text-textMain text-xs border border-borderMuted">
                      #3
                    </span>
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-amber-400">
                      Bronze
                    </span>
                  </div>
                  <span className="rounded-full bg-surfaceElevated px-2.5 py-0.5 text-[9px] font-mono font-semibold text-textMuted border border-borderMuted">
                    {top3.category}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-1.5 rounded-xl bg-canvas border border-borderMuted shrink-0">
                    <FaviconImage url={top3.url} fallback={top3.logo} className="w-7 h-7 rounded-lg" size={128} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-heading font-bold text-textMain hover:text-limeAccent transition truncate">
                      <a href={top3.url} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(top3); }} className="inline-flex items-center gap-1.5 cursor-pointer">
                        {top3.name}
                        <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
                      </a>
                    </h3>
                    <p className="text-[11px] text-textMuted line-clamp-1 mt-0.5 leading-snug">
                      {top3.tagline}
                    </p>
                  </div>
                </div>

                {/* Stats Box */}
                <div className="my-3 rounded-xl bg-canvas/60 p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider font-semibold text-textMuted block mb-0.5">
                      {board === 'all-time' ? 'Total Paid Amount' : "Today's Payment (UTC)"}
                    </span>
                    <div className="text-base sm:text-lg font-mono font-bold text-textMain tracking-tight tabular-nums">
                      ${(board === 'all-time' ? top3.allTimeSpend : calculateProductTodaySpend(top3)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-mono text-textMuted font-medium tabular-nums">{top3.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[9px] text-emeraldAccent font-semibold mt-0.5 flex items-center gap-1 justify-end">
                      <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(3, top3.url, top3.name); }}
                  className={`w-full rounded-xl font-heading font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 border transition-all duration-200 active:scale-[0.98] cursor-pointer ${isUserStartup(top3.url)
                    ? 'bg-limeAccent text-[#0B0F10] border-limeAccent hover:brightness-110 font-black shadow-md shadow-limeAccent/20'
                    : 'bg-surfaceElevated hover:bg-surface text-textMain border-borderMuted hover:border-limeAccent/50'
                    }`}
                >
                  {isUserStartup(top3.url) ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0B0F10]" />
                      <span>Defend Rank #3 (${getOvertakeCost(3).toLocaleString()})</span>
                    </>
                  ) : (
                    <>
                      <Coins className="h-3.5 w-3.5 text-textMuted" />
                      <span>Claim #3 (${getOvertakeCost(3).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SECTION 3: ONE-CLICK QUICK CLAIM DOCK ----------------- */}
      <div className="relative rounded-2xl border-2 border-limeAccent/60 bg-surface/95 p-3.5 sm:p-4 shadow-xl backdrop-blur-xl">
        <form onSubmit={handleQuickClaimSubmit} className="space-y-2.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-3">
            {/* Left: Favicon Preview */}
            <div className="hidden sm:flex items-center justify-center pl-1">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-canvas border border-borderMuted">
                <FaviconImage
                  url={quickUrl}
                  fallback="🚀"
                  className="w-6 h-6 rounded-lg object-contain"
                  size={128}
                />
                {quickDomain && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emeraldAccent ring-2 ring-surface">
                    <Check className="h-2 w-2 text-[#08090A] stroke-[3]" />
                  </span>
                )}
              </div>
            </div>

            {/* Center: Input */}
            <div className="flex-1 min-w-0 px-1 sm:px-2">
              <input
                type="text"
                required
                placeholder="Paste your startup link to claim rank (e.g. acme.com or https://...)"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-medium text-textMain placeholder:text-textMuted/50 focus:outline-none font-sans"
              />
            </div>

            {/* Target Rank Preset Selector & Custom Rank Option */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-surfaceElevated rounded-xl px-2 py-1 border border-borderMuted shrink-0">
              <span className="text-[11px] font-mono font-bold text-textMuted hidden sm:inline">
                Rank:
              </span>
              {[1, 2, 3, 5, 10].map((rk) => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => {
                    setQuickTargetRank(rk);
                    setCustomRankInput('');
                  }}
                  className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition-all ${quickTargetRank === rk && customRankInput === ''
                    ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20 font-black'
                    : 'text-textMuted hover:text-textMain hover:bg-canvas'
                    }`}
                >
                  #{rk}
                </button>
              ))}

              {/* Custom Rank Input Option */}
              <div className="flex items-center pl-1 border-l border-borderMuted">
                <div
                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg border transition-all ${customRankInput !== ''
                    ? 'bg-limeAccent text-[#0B0F10] border-limeAccent shadow-md shadow-limeAccent/20 font-black'
                    : 'bg-canvas border-borderMuted text-textMuted hover:border-limeAccent/50 focus-within:border-limeAccent focus-within:text-limeAccent'
                    }`}
                >
                  <span className={`text-[11px] font-mono font-bold ${customRankInput !== '' ? 'text-[#0B0F10]' : 'text-textMuted'}`}>
                    #
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Custom"
                    value={customRankInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setCustomRankInput(raw);
                      const val = parseInt(raw);
                      if (!isNaN(val) && val >= 1) {
                        setQuickTargetRank(Math.min(100, Math.max(1, val)));
                      }
                    }}
                    className={`w-12 sm:w-14 bg-transparent text-xs font-mono font-bold text-center outline-none ${customRankInput !== ''
                      ? 'text-[#0B0F10] placeholder:text-[#0B0F10]/50 font-black'
                      : 'text-textMain placeholder:text-textMuted/50'
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Claim CTA Button */}
            <button
              type="submit"
              disabled={!quickUrl.trim()}
              className="w-full md:w-auto rounded-xl bg-limeAccent hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0F10] font-heading font-black py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/25 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 fill-[#0B0F10]" />
              <span>Claim #{quickTargetRank}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Live Intel Strip */}
          {quickDomain && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-borderMuted text-[11px] font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emeraldAccent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emeraldAccent" />
                </span>
                <span className="text-textMain font-bold">{inferredQuickName || quickDomain}</span>
                <span className="text-textMuted">({quickDomain})</span>
                {quickBrowserTitle && (
                  <span className="text-limeAccent font-medium truncate max-w-[200px] sm:max-w-[280px]">
                    · &ldquo;{quickBrowserTitle}&rdquo;
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-textMuted">Cost to take #{quickTargetRank}:</span>
                <strong className="text-limeAccent font-heading font-black text-sm tabular-nums">
                  ${quickCalc.netPayable.toLocaleString()}
                </strong>
                {quickCalc.currentHolder && (
                  <span className="text-textMuted text-[10px]">
                    (Outbidding {quickCalc.currentHolder.name})
                  </span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ----------------- SECTION 4: SEARCH, CATEGORIES & COMPACT TABLE VIEW ----------------- */}
      <div className="space-y-3">
        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
            <input
              type="text"
              placeholder="Search products, domains, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-surface border border-borderMuted pl-9 pr-4 py-2 text-xs font-medium text-textMain placeholder:text-textMuted/50 focus:outline-none focus:border-limeAccent/60 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-mono font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-limeAccent text-[#0B0F10] font-bold shadow-sm'
                  : 'bg-surface border border-borderMuted text-textMuted hover:text-textMain hover:bg-surfaceElevated'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Table View */}
        <div className="rounded-2xl border border-borderMuted bg-surface/90 overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderMuted bg-surfaceElevated/60 text-[10px] font-mono uppercase tracking-wider text-textMuted">
                  <th className="py-3 px-4 w-14">Rank</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3 px-4 text-right">
                    {board === 'all-time' ? 'Total Paid' : "Today's Paid"}
                  </th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Clicks</th>
                  <th className="py-3 px-4 text-right w-36">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderMuted text-xs">
                {filteredProducts.map((product, index) => {
                  const rank = index + 1;
                  const isMine = isUserStartup(product.url);
                  const spend = board === 'all-time' ? product.allTimeSpend : calculateProductTodaySpend(product);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => handleCardClick(product)}
                      className={`group hover:bg-surfaceElevated/60 transition-colors cursor-pointer ${isMine ? 'bg-limeAccent/[0.04]' : ''
                        }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs ${rank === 1
                            ? 'bg-limeAccent text-[#0B0F10] font-black'
                            : rank === 2
                              ? 'bg-slate-300 text-[#0B0F10] font-black'
                              : rank === 3
                                ? 'bg-amber-400 text-[#0B0F10] font-black'
                                : 'text-textMuted'
                            }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <FaviconImage
                            url={product.url}
                            fallback={product.logo}
                            className="w-7 h-7 rounded-lg object-contain shrink-0"
                            size={128}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-heading font-bold text-textMain group-hover:text-limeAccent transition truncate">
                                {product.name}
                              </span>
                              {isMine && (
                                <span className="rounded bg-limeAccent/20 px-1.5 py-0.2 text-[9px] font-mono font-bold text-limeAccent border border-limeAccent/30">
                                  YOU
                                </span>
                              )}
                              <ExternalLink className="h-3 w-3 text-textMuted opacity-40 group-hover:opacity-100 transition shrink-0" />
                            </div>
                            <p className="text-[11px] text-textMuted line-clamp-1 mt-0.5">
                              {product.tagline}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-mono text-textMuted border border-borderMuted">
                          {product.category}
                        </span>
                      </td>

                      {/* Spend */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-textMain tabular-nums">
                        ${spend.toLocaleString()}
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-4 text-right font-mono text-textMuted tabular-nums hidden sm:table-cell">
                        {product.clicks?.toLocaleString() || 0}
                      </td>

                      {/* Outbid CTA */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClaimRank(rank, product.url, product.name);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-heading font-bold transition-all active:scale-95 cursor-pointer ${isMine
                            ? 'bg-limeAccent text-[#0B0F10] hover:brightness-110'
                            : 'bg-surfaceElevated hover:bg-limeAccent hover:text-[#0B0F10] text-textMain border border-borderMuted hover:border-limeAccent'
                            }`}
                        >
                          {isMine ? 'Defend' : `Outbid (#${rank})`}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
