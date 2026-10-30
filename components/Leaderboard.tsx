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

  // Sorted strictly by financial hierarchy with tie-breaker rule
  const sortedProducts = useMemo(() => {
    return sortLeaderboard(products, board);
  }, [products, board]);

  // Check if current user has an active listing on this board
  const userListing = useMemo(() => {
    return sortedProducts.find((p) => isUserStartup(p.url));
  }, [sortedProducts, userStartups]);

  const userListingRank = useMemo(() => {
    if (!userListing) return null;
    return sortedProducts.findIndex((p) => p.id === userListing.id) + 1;
  }, [sortedProducts, userListing]);

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

  // Quick claim bid calculation for the inline bar
  const quickCalc = useMemo(() => {
    return calculateRequiredBid({
      targetRank: quickTargetRank,
      sortedProducts,
      board,
      existingProductUrl: quickUrl,
    });
  }, [quickTargetRank, sortedProducts, board, quickUrl]);

  // Handle Quick Add and Claim to Gateway
  const handleQuickClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickUrl.trim();
    if (!clean) return;

    const finalUrl = clean.startsWith('http') ? clean : `https://${clean}`;
    const inferred = inferStartupName(finalUrl) || 'My Startup';

    // Register to user's saved startups
    const updated = Array.from(new Set([...userStartups, finalUrl]));
    setUserStartups(updated);
    try {
      localStorage.setItem('azyra_user_startups', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (onAddUserStartup) {
      onAddUserStartup(finalUrl);
    }

    // Direct transition to select rank & gateway modal
    const targetRank =
      customRankInput && !isNaN(parseInt(customRankInput))
        ? Math.min(100, Math.max(1, parseInt(customRankInput)))
        : quickTargetRank;

    onClaimRank(targetRank, finalUrl, inferred);
  };


  const handleCardClick = (product: ProductEntry) => {
    if (!product?.url) return;

    if (onTrackClick) {
      onTrackClick(product);
    } else {
      fetch('/api/products/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productUrl: product.url,
          productName: product.name,
        }),
        keepalive: true,
      }).catch(() => {});
    }

    const rawUrl = product.url.trim();
    const targetUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const quickDomain = extractDomain(quickUrl);
  const inferredQuickName = inferStartupName(quickUrl);
  const quickExistingProduct = useMemo(() => {
    if (!quickDomain) return null;
    return sortedProducts.find((p) => extractDomain(p.url) === quickDomain);
  }, [quickDomain, sortedProducts]);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Board Selector Tabs & Daily UTC Countdown Header */}
      <div className="card-craft flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-xl p-2 shadow-lg">
        <div className="flex w-full sm:w-auto items-center gap-1.5 p-0.5 bg-surfaceElevated rounded-lg border border-borderMuted">
          <button
            onClick={() => setBoard('all-time')}
            className={`cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-heading font-bold transition-all ${board === 'all-time'
              ? 'bg-limeAccent text-[#070B0C] shadow-sm shadow-limeAccent/20'
              : 'text-textMuted hover:text-textMain hover:bg-surface'
              }`}
          >
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">All-Time</span>
            <span className="hidden sm:inline">All-Time Board</span>
            <span className="rounded-full bg-[#070B0C]/20 px-1.5 py-0.2 text-[9px] font-mono hidden xs:inline">
              Permanent
            </span>
          </button>

          <button
            onClick={() => setBoard('daily')}
            className={`cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-heading font-bold transition-all ${board === 'daily'
              ? 'bg-limeAccent text-[#070B0C] shadow-sm shadow-limeAccent/20'
              : 'text-textMuted hover:text-textMain hover:bg-surface'
              }`}
          >
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Daily 24h</span>
            <span className="hidden sm:inline">Today's Board (Daily)</span>
            <span className="rounded-full bg-[#070B0C]/20 px-1.5 py-0.2 text-[9px] font-mono hidden xs:inline">
              UTC
            </span>
          </button>
        </div>

        {/* Board description & UTC Reset Timer */}
        <div className="flex items-center gap-2.5 text-xs text-textMuted px-2">
          {board === 'daily' ? (
            <div className="flex items-center gap-2 rounded-lg bg-emeraldAccent/10 border border-emeraldAccent/30 px-2.5 py-1 text-emeraldAccent text-xs">
              <Clock className="h-3.5 w-3.5 text-emeraldAccent animate-spin" style={{ animationDuration: '8s' }} />
              <span>Next UTC Reset in:</span>
              <strong className="font-mono text-emeraldAccent font-bold">{utcCountdown}</strong>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-textMuted text-xs">
              <Calendar className="h-3.5 w-3.5 text-limeAccent" />
              <span>Cumulative lifetime spend • Listings never expire</span>
            </div>
          )}
        </div>
      </div>



      {/* TOP 3 PODIUM / SPOTLIGHT SHOWCASE */}
      {searchTerm === '' && selectedCategory === 'All' && sortedProducts.length >= 3 && (
        <div className="pt-0 pb-1">


          {/* Podium Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gapOvertake requires +$5 min-3 sm:gap-3.5 lg:gap-4 items-end">

            {/* ----------------- RANK 2 (SILVER GLASS) ----------------- */}
            {top2 && (
              <div
                id="rank-2"
                onClick={() => handleCardClick(top2)}
                className={`order-2 md:order-1 relative rounded-2xl p-4 sm:p-4.5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-xl border bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] cursor-pointer hover:border-limeAccent/60 ${isUserStartup(top2.url)
                  ? 'border-limeAccent ring-2 ring-limeAccent/50 shadow-[0_0_30px_rgba(209,250,77,0.2)]'
                  : 'border-white/10 hover:border-slate-300/30'
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
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 font-mono font-black text-textMain text-xs border border-white/10 backdrop-blur-md shadow-inner">
                      #2
                    </span>
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-300/80">
                      Silver
                    </span>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-mono font-semibold text-textMuted border border-white/10 backdrop-blur-sm">
                    {top2.category}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0 shadow-inner backdrop-blur-md">
                    <FaviconImage url={top2.url} fallback={top2.logo} className="w-7 h-7 rounded-lg" size={128} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-heading font-black text-textMain hover:text-limeAccent transition truncate">
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
                <div className="my-2.5 rounded-xl bg-black/25 p-2.5 border border-white/5 backdrop-blur-md flex justify-between items-center shadow-inner">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider font-semibold text-textMuted/70 block mb-0.5">
                      {board === 'all-time' ? 'Total Paid Amount' : "Today's Payment (UTC)"}
                    </span>
                    <div className="text-base sm:text-lg font-mono font-black text-textMain tracking-tight">
                      ${(board === 'all-time' ? top2.allTimeSpend : calculateProductTodaySpend(top2)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-mono text-textMuted font-medium">{top2.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">Active</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(2, top2.url, top2.name); }}
                  className={`w-full rounded-xl font-heading font-bold py-2 px-3 text-xs flex items-center justify-center gap-1.5 border transition-all duration-200 active:scale-[0.98] cursor-pointer ${isUserStartup(top2.url)
                    ? 'bg-limeAccent text-[#0B0F10] border-limeAccent hover:brightness-110 font-black shadow-md shadow-limeAccent/20'
                    : 'bg-white/5 hover:bg-white/10 text-textMain border-white/10 hover:border-limeAccent/50 backdrop-blur-md shadow-sm'
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
                className={`order-1 md:order-2 relative rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.01] -translate-y-1.5 backdrop-blur-2xl border-2 bg-gradient-to-b from-limeAccent/15 via-white/[0.05] to-black/40 shadow-[0_0_40px_rgba(209,250,77,0.2)] cursor-pointer hover:shadow-[0_0_50px_rgba(209,250,77,0.35)] ${isUserStartup(top1.url)
                  ? 'border-limeAccent ring-4 ring-limeAccent/40 shadow-[0_0_50px_rgba(209,250,77,0.35)]'
                  : 'border-limeAccent/80'
                  }`}
              >
                {/* King Crown Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-limeAccent px-3 py-0.5 text-[10px] font-heading font-black text-[#0B0F10] shadow-md shadow-limeAccent/40 border border-limeAccent whitespace-nowrap">
                  <Crown className="h-3.5 w-3.5 fill-[#0B0F10]" />
                  <span>{isUserStartup(top1.url) ? 'YOUR REIGNING #1 LISTING' : 'REIGNING #1 KING'}</span>
                </div>

                {/* Header Row */}
                <div className="flex items-center justify-between mb-2.5 pt-1.5">
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
                  <span className="rounded-full bg-limeAccent/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/30 backdrop-blur-md">
                    {top1.category}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="p-2 rounded-xl bg-black/40 border border-limeAccent/40 shadow-inner shrink-0 backdrop-blur-md">
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
                <div className="my-2.5 rounded-xl bg-black/35 p-2.5 border border-limeAccent/30 flex justify-between items-center shadow-inner backdrop-blur-md">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-widest font-bold text-limeAccent/90 block mb-0.5">
                      {board === 'all-time' ? 'Dominant Paid Amount' : "Today's Payment (UTC)"}
                    </span>
                    <div className="text-lg sm:text-xl font-mono font-black text-limeAccent tracking-tight">
                      ${(board === 'all-time' ? top1.allTimeSpend : calculateProductTodaySpend(top1)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-mono font-bold text-textMain">
                      {top1.clicks?.toLocaleString() || 0} clicks
                    </div>
                    <div className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 justify-end mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Prime Spot
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(1, top1.url, top1.name); }}
                  className="w-full rounded-xl bg-limeAccent hover:bg-limeAccent/90 text-[#0B0F10] font-heading font-black py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-limeAccent/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
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
                className={`order-3 relative rounded-2xl p-4 sm:p-4.5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-xl border bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] cursor-pointer hover:border-limeAccent/60 ${isUserStartup(top3.url)
                  ? 'border-limeAccent ring-2 ring-limeAccent/50 shadow-[0_0_30px_rgba(209,250,77,0.2)]'
                  : 'border-white/10 hover:border-amber-600/30'
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
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 font-mono font-black text-textMain text-xs border border-white/10 backdrop-blur-md shadow-inner">
                      #3
                    </span>
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-amber-500/80">
                      Bronze
                    </span>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-mono font-semibold text-textMuted border border-white/10 backdrop-blur-sm">
                    {top3.category}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0 shadow-inner backdrop-blur-md">
                    <FaviconImage url={top3.url} fallback={top3.logo} className="w-7 h-7 rounded-lg" size={128} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-heading font-black text-textMain hover:text-limeAccent transition truncate">
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
                <div className="my-2.5 rounded-xl bg-black/25 p-2.5 border border-white/5 backdrop-blur-md flex justify-between items-center shadow-inner">
                  <div>
                    <span className="text-[8px] uppercase font-mono tracking-wider font-semibold text-textMuted/70 block mb-0.5">
                      {board === 'all-time' ? 'Total Paid Amount' : "Today's Payment (UTC)"}
                    </span>
                    <div className="text-base sm:text-lg font-mono font-black text-textMain tracking-tight">
                      ${(board === 'all-time' ? top3.allTimeSpend : calculateProductTodaySpend(top3)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-mono text-textMuted font-medium">{top3.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">Active</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(3, top3.url, top3.name); }}
                  className={`w-full rounded-xl font-heading font-bold py-2 px-3 text-xs flex items-center justify-center gap-1.5 border transition-all duration-200 active:scale-[0.98] cursor-pointer ${isUserStartup(top3.url)
                    ? 'bg-limeAccent text-[#0B0F10] border-limeAccent hover:brightness-110 font-black shadow-md shadow-limeAccent/20'
                    : 'bg-white/5 hover:bg-white/10 text-textMain border-white/10 hover:border-limeAccent/50 backdrop-blur-md shadow-sm'
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

      {/* QUICK CLAIM COMMAND BAR (Directly after Top 3, Start of Leaderboard) */}
      {isQuickBarOpen && (
        <div className="relative rounded-2xl border-2 border-limeAccent bg-gradient-to-r from-[#0C1214] via-[#10191B] to-[#0C1214] p-3 sm:p-3.5 shadow-[0_0_35px_rgba(209,250,77,0.16)] ring-1 ring-limeAccent/30 transition-all hover:shadow-[0_0_45px_rgba(209,250,77,0.22)]">
          <form onSubmit={handleQuickClaim} className="space-y-2.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              {/* Left: Favicon Box */}
              <div className="flex items-center gap-2 pl-1 shrink-0">
                <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-surfaceElevated border border-borderMuted shadow-inner">
                  <FaviconImage
                    url={quickUrl}
                    fallback="🚀"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-contain"
                    size={128}
                  />
                  {quickDomain && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0C1214]">
                      <Check className="h-2 w-2 text-black stroke-[3]" />
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
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-textMain placeholder:text-textMuted/45 focus:outline-none font-sans"
                />
              </div>

              {/* Target Rank Preset Selector & Custom Rank Option */}
              <div className="flex items-center justify-between sm:justify-start gap-1 bg-surfaceElevated/80 rounded-xl px-2 py-1 border border-borderMuted/60 shrink-0">
                <span className="text-[11px] font-mono font-bold text-textMuted/70 hidden sm:inline">
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
                      ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/30 font-black scale-105'
                      : 'text-textMuted hover:text-textMain hover:bg-surface'
                      }`}
                  >
                    #{rk}
                  </button>
                ))}

                {/* Custom Rank Input Option */}
                <div className="flex items-center pl-1 border-l border-borderMuted/60">
                  <div
                    className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg border transition-all ${customRankInput !== ''
                      ? 'bg-limeAccent text-[#0B0F10] border-limeAccent shadow-md shadow-limeAccent/30 font-black ring-1 ring-limeAccent/40'
                      : 'bg-surface/70 border-borderMuted text-textMuted hover:border-limeAccent/50 focus-within:border-limeAccent focus-within:text-limeAccent'
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

            {/* Live Intel Strip (Appears compactly when URL entered) */}
            {quickDomain && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-white font-bold">{inferredQuickName || quickDomain}</span>
                  <span className="text-textMuted">({quickDomain})</span>
                  {quickBrowserTitle && (
                    <span className="text-limeAccent/90 font-medium truncate max-w-[180px] sm:max-w-[260px]">
                      · &ldquo;{quickBrowserTitle}&rdquo;
                    </span>
                  )}

                </div>
                <div className="flex items-center gap-2">
                  <span className="text-textMuted">Cost to take #{quickTargetRank}:</span>
                  <strong className="text-limeAccent font-heading font-black text-sm">
                    ${quickCalc.netPayable.toLocaleString()}
                  </strong>
                  {quickCalc.currentHolder && (
                    <span className="text-textMuted/70 text-[10px]">
                      (Outbidding {quickCalc.currentHolder.name})
                    </span>
                  )}
                </div>
              </div>
            )}
          </form>
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
                className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-heading transition ${selectedCategory === cat
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
      <div className="card-craft rounded-2xl overflow-hidden shadow-2xl">
        {/* Table header bar */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-surfaceElevated/70 border-b border-borderMuted text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5 font-heading">Product & Pitch</div>
          <div className="col-span-2 text-right">
            {board === 'all-time' ? 'All-Time Paid' : "Today's Payment"}
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
              const todayPaid = calculateProductTodaySpend(product);
              const spend = board === 'all-time' ? (product.allTimeSpend || 0) : todayPaid;
              const overtakeCost = getOvertakeCost(actualRank);
              const isOwnListing = isUserStartup(product.url);

              return (
                <div
                  key={product.id}
                  id={`rank-${actualRank}`}
                  onClick={() => handleCardClick(product)}
                  className={`group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 sm:px-6 py-4 items-center transition-all scroll-mt-24 cursor-pointer hover:bg-surfaceElevated/60 ${isOwnListing
                    ? 'relative z-10 bg-gradient-to-r from-limeAccent/15 via-limeAccent/[0.04] to-surface border-l-4 border-l-limeAccent border-y border-r border-limeAccent/50 rounded-2xl shadow-[0_0_30px_rgba(209,250,77,0.1)] ring-1 ring-limeAccent/40 my-1'
                    : actualRank === 1
                      ? 'bg-limeAccent/[0.04] hover:bg-surfaceElevated/40'
                      : 'hover:bg-surfaceElevated/40'
                    }`}
                >
                  {/* Rank Column */}
                  <div className="md:col-span-1 flex md:flex-col items-center justify-between md:justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl font-mono text-sm font-black ${isOwnListing
                          ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/30 ring-2 ring-limeAccent/60'
                          : actualRank === 1
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
                    <div className="p-2 rounded-xl bg-surfaceElevated border border-borderMuted shrink-0">
                      <FaviconImage url={product.url} fallback={product.logo} className="w-8 h-8 rounded-lg" size={128} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(product); }} className="font-heading font-bold text-textMain group-hover:text-limeAccent transition flex items-center gap-1.5 text-sm sm:text-base cursor-pointer"
                        >
                          {product.name}
                          <ExternalLink className="h-3 w-3 text-textMuted group-hover:text-limeAccent" />
                        </a>

                        {/* HIGHLIGHT BADGE FOR OWN LISTING */}
                        {isOwnListing && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-limeAccent text-[#0B0F10] font-heading font-black text-[10px] uppercase tracking-wider shadow-sm shadow-limeAccent/40 shrink-0">
                            <Sparkles className="h-2.5 w-2.5 fill-[#0B0F10]" />
                            YOUR LISTING
                          </span>
                        )}

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
                      {isOwnListing && (
                        <p className="text-[11px] font-mono text-limeAccent font-bold mt-0.5">
                          ★ Your active sovereign rank #{actualRank} • Safeguard against outbids
                        </p>
                      )}
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(product); }} className="text-[11px] font-mono text-textMuted/70 hover:text-textMain block truncate mt-0.5 cursor-pointer"
                      >
                        {product.url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>

                  {/* Financial Total Spend Column */}
                  <div className="md:col-span-2 flex md:flex-col justify-between items-center md:items-end">
                    <span className="text-xs text-textMuted md:hidden">
                      {board === 'all-time' ? 'All-Time Paid:' : "Today's Payment:"}
                    </span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-base sm:text-lg text-textMain">
                        ${spend.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-textMuted">
                        {board === 'all-time'
                          ? `Today: $${todayPaid.toLocaleString()}`
                          : `All-Time: $${(product.allTimeSpend || 0).toLocaleString()}`}
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
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onClaimRank(actualRank, product.url, product.name); }}
                      className={`w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl font-mono font-bold px-3.5 py-2 text-xs transition-all shadow-sm active:scale-[0.98] group/btn cursor-pointer ${isOwnListing
                        ? 'bg-limeAccent text-[#0B0F10] hover:brightness-110 font-heading font-black shadow-lg shadow-limeAccent/20'
                        : 'bg-surfaceElevated hover:bg-limeAccent hover:text-[#0B0F10] text-textMain border border-borderMuted hover:border-limeAccent'
                        }`}
                    >
                      {isOwnListing ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-[#0B0F10]" />
                          <span>Defend / Boost (#{actualRank})</span>
                        </>
                      ) : (
                        <>
                          <Coins className="h-3.5 w-3.5 text-limeAccent group-hover/btn:text-[#0B0F10] transition" />
                          <span>
                            Claim #{actualRank} (${overtakeCost.toLocaleString()})
                          </span>
                        </>
                      )}
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
