'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  ExternalLink,
  Search,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ProductEntry, BoardType } from '../lib/types';
import { sortLeaderboard, calculateRequiredBid, extractDomain, inferStartupName, calculateProductTodaySpend } from '../lib/data';
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

  // UTC countdown timer
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
    <div className="space-y-4">
      {/* ----------------- SECTION 1: HEADER CONTROLS & BOARD SELECTOR ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-borderMuted rounded-lg p-2.5 sm:px-4 sm:py-3 shadow-xs">
        {/* Board Toggle: All-Time vs Today */}
        <div className="flex items-center gap-1 bg-surfaceElevated p-0.5 rounded-md border border-borderMuted self-start sm:self-auto">
          <button
            onClick={() => setBoard('all-time')}
            className={`cursor-pointer px-3 py-1.5 rounded-sm text-xs font-heading font-medium transition-all ${
              board === 'all-time'
                ? 'bg-surface text-textMain font-bold shadow-xs border border-borderStrong'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            All-Time Volume
          </button>
          <button
            onClick={() => setBoard('daily')}
            className={`cursor-pointer px-3 py-1.5 rounded-sm text-xs font-heading font-medium transition-all flex items-center gap-1.5 ${
              board === 'daily'
                ? 'bg-surface text-textMain font-bold shadow-xs border border-borderStrong'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-textMuted" />
            <span>24h Race</span>
          </button>
        </div>

        {/* Live Status Info */}
        <div className="flex items-center gap-3 text-xs text-textMuted">
          {board === 'daily' ? (
            <div className="flex items-center gap-1.5 text-textMain font-medium bg-surfaceElevated px-2.5 py-1 rounded-md border border-borderMuted">
              <Clock className="h-3 w-3 text-limeAccent" />
              <span>Resets in: <strong className="font-mono-numbers">{utcCountdown}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-textMuted font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent animate-pulse" />
              <span>Open Ledger Direct Bidding</span>
            </div>
          )}
        </div>
      </div>

      {/* ----------------- SECTION 2: TOP 3 SOVEREIGN PODIUM (Financial Orderbook Style) ----------------- */}
      {selectedCategory === 'All' && !searchTerm && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-sans uppercase tracking-wider text-textMuted font-semibold flex items-center gap-1.5">
              <span>Top Sovereign Positions</span>
            </span>
            <span className="text-[11px] font-sans text-textMuted">Ties settled by listing timestamp</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            {/* RANK 2 */}
            {top2 && (
              <div
                id="rank-2"
                onClick={() => handleCardClick(top2)}
                className={`order-2 md:order-1 card-terminal p-4.5 transition cursor-pointer ${
                  isUserStartup(top2.url) ? 'border-limeAccent ring-1 ring-limeAccent/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-surfaceElevated font-mono-numbers text-xs font-bold text-textMain border border-borderMuted">
                      #2
                    </span>
                    <span className="text-xs font-heading font-bold text-textMain">
                      Rank Two
                    </span>
                  </div>
                  <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[11px] font-sans font-medium text-textMain border border-borderMuted">
                    {top2.category}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 mb-3">
                  <div className="p-1 rounded bg-canvas border border-borderMuted shrink-0">
                    <FaviconImage url={top2.url} fallback={top2.logo} className="w-6 h-6 rounded" size={128} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-heading font-bold text-textMain truncate flex items-center gap-1.5">
                      {top2.name}
                      <ExternalLink className="h-3 w-3 text-textMuted hover:text-textMain opacity-60" />
                    </h3>
                    <p className="text-xs sm:text-[13px] text-textMuted line-clamp-2 mt-1 leading-normal font-medium">
                      {top2.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-3 rounded-md bg-surfaceElevated p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[11px] uppercase font-sans tracking-wider text-textMuted font-bold block">
                      {board === 'all-time' ? 'Total Volume' : 'Today Paid'}
                    </span>
                    <div className="text-xl font-mono-numbers font-black text-textMain mt-0.5">
                      ${(board === 'all-time' ? top2.allTimeSpend : calculateProductTodaySpend(top2)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono-numbers font-semibold text-textMain">{top2.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-xs text-textMain dark:text-emeraldAccent font-semibold mt-0.5">Active</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(2, top2.url, top2.name); }}
                  className="w-full rounded-md font-heading font-semibold py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 border border-borderMuted bg-surfaceElevated hover:bg-surface text-textMain transition cursor-pointer active:scale-[0.98]"
                >
                  <span>Claim #2 (${getOvertakeCost(2).toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* RANK 1 (Sovereign Position) */}
            {top1 && (
              <div
                id="rank-1"
                onClick={() => handleCardClick(top1)}
                className={`order-1 md:order-2 card-sovereign p-5 transition cursor-pointer ${
                  isUserStartup(top1.url) ? 'ring-2 ring-limeAccent' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-limeAccent text-[#090A0C] font-mono-numbers text-xs font-black">
                      #1
                    </span>
                    <span className="text-xs font-heading font-bold text-textMain dark:text-limeAccent flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5 text-textMain dark:text-limeAccent fill-current" />
                      Sovereign #1
                    </span>
                  </div>
                  <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[11px] font-sans font-medium text-textMain border border-borderMuted">
                    {top1.category}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 mb-3">
                  <div className="p-1 rounded bg-canvas border border-limeAccent/30 shrink-0">
                    <FaviconImage url={top1.url} fallback={top1.logo} className="w-7 h-7 rounded" size={128} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-heading font-extrabold text-textMain truncate flex items-center gap-1.5">
                      {top1.name}
                      <ExternalLink className="h-3.5 w-3.5 text-textMuted hover:text-textMain opacity-70" />
                    </h3>
                    <p className="text-xs sm:text-[13px] text-textMuted line-clamp-2 mt-1 leading-normal font-medium">
                      {top1.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-3 rounded-md bg-surfaceElevated p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[11px] uppercase font-sans tracking-wider text-textMuted font-bold block">
                      {board === 'all-time' ? 'Dominant Capital' : 'Today Paid'}
                    </span>
                    <div className="text-2xl font-mono-numbers font-black text-textMain dark:text-limeAccent mt-0.5">
                      ${(board === 'all-time' ? top1.allTimeSpend : calculateProductTodaySpend(top1)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono-numbers font-bold text-textMain">{top1.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-xs text-textMain dark:text-emeraldAccent font-semibold flex items-center gap-1.5 justify-end mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent" />
                      Prime Spot
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(1, top1.url, top1.name); }}
                  className="w-full rounded-md bg-limeAccent hover:brightness-105 text-[#090A0C] font-heading font-bold py-2.5 px-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                >
                  <span>Outbid Sovereign #1 (${getOvertakeCost(1).toLocaleString()})</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            )}

            {/* RANK 3 */}
            {top3 && (
              <div
                id="rank-3"
                onClick={() => handleCardClick(top3)}
                className={`order-3 card-terminal p-4.5 transition cursor-pointer ${
                  isUserStartup(top3.url) ? 'border-limeAccent ring-1 ring-limeAccent/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-surfaceElevated font-mono-numbers text-xs font-bold text-textMain border border-borderMuted">
                      #3
                    </span>
                    <span className="text-xs font-heading font-bold text-textMain">
                      Rank Three
                    </span>
                  </div>
                  <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[11px] font-sans font-medium text-textMain border border-borderMuted">
                    {top3.category}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 mb-3">
                  <div className="p-1 rounded bg-canvas border border-borderMuted shrink-0">
                    <FaviconImage url={top3.url} fallback={top3.logo} className="w-6 h-6 rounded" size={128} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-heading font-bold text-textMain truncate flex items-center gap-1.5">
                      {top3.name}
                      <ExternalLink className="h-3 w-3 text-textMuted hover:text-textMain opacity-60" />
                    </h3>
                    <p className="text-xs sm:text-[13px] text-textMuted line-clamp-2 mt-1 leading-normal font-medium">
                      {top3.tagline}
                    </p>
                  </div>
                </div>

                <div className="my-3 rounded-md bg-surfaceElevated p-3 border border-borderMuted flex justify-between items-center">
                  <div>
                    <span className="text-[11px] uppercase font-sans tracking-wider text-textMuted font-bold block">
                      {board === 'all-time' ? 'Total Volume' : 'Today Paid'}
                    </span>
                    <div className="text-xl font-mono-numbers font-black text-textMain mt-0.5">
                      ${(board === 'all-time' ? top3.allTimeSpend : calculateProductTodaySpend(top3)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono-numbers font-semibold text-textMain">{top3.clicks?.toLocaleString() || 0} clicks</div>
                    <div className="text-xs text-textMain dark:text-emeraldAccent font-semibold mt-0.5">Active</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClaimRank(3, top3.url, top3.name); }}
                  className="w-full rounded-md font-heading font-semibold py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 border border-borderMuted bg-surfaceElevated hover:bg-surface text-textMain transition cursor-pointer active:scale-[0.98]"
                >
                  <span>Claim #3 (${getOvertakeCost(3).toLocaleString()})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SECTION 3: QUICK CLAIM BIDDING DOCK ----------------- */}
      <div className="card-terminal p-3 sm:p-4">
        <form onSubmit={handleQuickClaimSubmit} className="space-y-2">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Input URL */}
            <div className="flex-1 flex items-center gap-2 bg-surfaceElevated rounded-md px-3 py-2 border border-borderMuted focus-within:border-borderStrong transition">
              <FaviconImage
                url={quickUrl}
                fallback="🌐"
                className="w-5 h-5 rounded object-contain shrink-0"
                size={64}
              />
              <input
                type="text"
                required
                placeholder="Paste startup URL to claim rank (e.g. acme.com)"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-sans text-textMain placeholder:text-textMuted/60 focus:outline-none"
              />
            </div>

            {/* Target Rank Preset Selector */}
            <div className="flex items-center gap-1 bg-surfaceElevated rounded-md px-2 py-1 border border-borderMuted shrink-0">
              <span className="text-xs font-sans font-medium text-textMuted px-1">
                Target:
              </span>
              {[1, 2, 3, 5, 10].map((rk) => (
                <button
                  key={rk}
                  type="button"
                  onClick={() => {
                    setQuickTargetRank(rk);
                    setCustomRankInput('');
                  }}
                  className={`cursor-pointer px-2 py-1 rounded text-xs font-mono-numbers font-medium transition ${
                    quickTargetRank === rk && customRankInput === ''
                      ? 'bg-surface text-textMain font-bold border border-borderStrong shadow-xs'
                      : 'text-textMuted hover:text-textMain'
                  }`}
                >
                  #{rk}
                </button>
              ))}

              <div className="flex items-center pl-1 border-l border-borderMuted">
                <input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="#"
                  value={customRankInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setCustomRankInput(raw);
                    const val = parseInt(raw);
                    if (!isNaN(val) && val >= 1) {
                      setQuickTargetRank(Math.min(100, Math.max(1, val)));
                    }
                  }}
                  className="w-10 bg-transparent text-xs font-mono-numbers font-medium text-center outline-none text-textMain placeholder:text-textMuted/50"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={!quickUrl.trim()}
              className="rounded-md bg-limeAccent hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-[#090A0C] font-heading font-bold py-2 px-5 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <span>Bid #{quickTargetRank}</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Real-Time Cost Feed */}
          {quickDomain && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-borderMuted text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-textMain font-semibold">{inferredQuickName || quickDomain}</span>
                <span className="text-textMuted">({quickDomain})</span>
                {quickBrowserTitle && (
                  <span className="text-textMuted truncate max-w-[220px]">
                    · {quickBrowserTitle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono-numbers">
                <span className="text-textMuted font-sans">Cost to take #{quickTargetRank}:</span>
                <strong className="text-textMain dark:text-limeAccent font-bold text-sm">
                  ${quickCalc.netPayable.toLocaleString()}
                </strong>
                {quickCalc.currentHolder && (
                  <span className="text-textMuted text-xs font-sans">
                    (Outbidding {quickCalc.currentHolder.name})
                  </span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ----------------- SECTION 4: TABLE VIEW ----------------- */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
            <input
              type="text"
              placeholder="Filter by product, domain, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md bg-surface border border-borderMuted pl-8.5 pr-3 py-1.5 text-xs text-textMain placeholder:text-textMuted/60 focus:outline-none focus:border-borderStrong transition"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer rounded px-2.5 py-1 text-[11px] font-sans transition ${
                  selectedCategory === cat
                    ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong'
                    : 'text-textMuted hover:text-textMain hover:bg-surfaceElevated'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Financial Table */}
        <div className="card-terminal overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-borderMuted bg-surfaceElevated text-xs uppercase font-sans tracking-wider text-textMuted font-bold">
                  <th className="py-3 px-3.5 w-12">#</th>
                  <th className="py-3 px-3.5">Product</th>
                  <th className="py-3 px-3.5 hidden md:table-cell">Category</th>
                  <th className="py-3 px-3.5 text-right">
                    {board === 'all-time' ? 'Total Volume' : 'Today Paid'}
                  </th>
                  <th className="py-3 px-3.5 text-right hidden sm:table-cell">Clicks</th>
                  <th className="py-3 px-3.5 text-right w-32">Action</th>
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
                      className={`hover:bg-surfaceElevated transition cursor-pointer ${
                        isMine ? 'bg-limeAccent/[0.04]' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono-numbers font-medium">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs ${
                            rank === 1
                              ? 'bg-limeAccent text-[#090A0C] font-black'
                              : rank === 2 || rank === 3
                              ? 'bg-surfaceElevated text-textMain font-bold border border-borderMuted'
                              : 'text-textMuted font-semibold'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <FaviconImage
                            url={product.url}
                            fallback={product.logo}
                            className="w-5 h-5 rounded object-contain shrink-0"
                            size={64}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-bold text-textMain text-sm hover:underline truncate">
                                {product.name}
                              </span>
                              {isMine && (
                                <span className="rounded bg-limeAccent/20 px-1.5 py-0.5 text-[9px] font-sans font-bold text-textMain dark:text-limeAccent">
                                  YOU
                                </span>
                              )}
                              <ExternalLink className="h-3 w-3 text-textMuted opacity-50 shrink-0" />
                            </div>
                            <p className="text-xs text-textMuted line-clamp-1 mt-0.5 leading-normal">
                              {product.tagline}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 hidden md:table-cell">
                        <span className="rounded bg-surfaceElevated px-2.5 py-1 text-[11px] font-sans font-medium text-textMain border border-borderMuted">
                          {product.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono-numbers font-bold text-textMain">
                        ${spend.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono-numbers text-textMuted hidden sm:table-cell">
                        {product.clicks?.toLocaleString() || 0}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClaimRank(rank, product.url, product.name);
                          }}
                          className={`rounded px-2.5 py-1 text-xs font-heading font-semibold transition active:scale-95 cursor-pointer ${
                            isMine
                              ? 'bg-limeAccent text-[#090A0C]'
                              : 'bg-surfaceElevated hover:bg-surface border border-borderMuted hover:border-borderStrong text-textMain'
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
