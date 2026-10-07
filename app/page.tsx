'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Coins,
  CheckCircle,
  Megaphone
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ActivityTicker from '../components/ActivityTicker';
import Leaderboard from '../components/Leaderboard';
import HowItWorks from '../components/HowItWorks';
import ClaimRankModal from '../components/ClaimRankModal';
import AzyraLogo from '../components/AzyraLogo';
import { INITIAL_PRODUCTS, INITIAL_ACTIVITIES, sortLeaderboard } from '../lib/data';
import { ProductEntry, BoardType, BidActivity } from '../lib/types';
import { triggerConfetti } from '../lib/confetti';

export default function Home() {
  const [products, setProducts] = useState<ProductEntry[]>(INITIAL_PRODUCTS);
  const [activities, setActivities] = useState<BidActivity[]>(INITIAL_ACTIVITIES);
  const [board, setBoard] = useState<BoardType>('all-time');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetRank, setModalTargetRank] = useState(1);
  const [modalProductUrl, setModalProductUrl] = useState('');

  // Hydrate from localStorage if available
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('outbid_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
      const savedActivities = localStorage.getItem('outbid_activities');
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage when state changes
  const saveState = (updatedProducts: ProductEntry[], updatedActivities: BidActivity[]) => {
    try {
      localStorage.setItem('outbid_products', JSON.stringify(updatedProducts));
      localStorage.setItem('outbid_activities', JSON.stringify(updatedActivities));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenBidModal = (targetRank: number = 1, productUrl: string = '') => {
    setModalTargetRank(targetRank);
    setModalProductUrl(productUrl);
    setIsModalOpen(true);
  };

  // Process a new bid or bump
  const handlePlaceBid = ({
    productName,
    productUrl,
    tagline,
    logo,
    category,
    bidAmount,
    targetRank,
    isBump,
  }: {
    productName: string;
    productUrl: string;
    tagline: string;
    logo: string;
    category: ProductEntry['category'];
    bidAmount: number;
    targetRank: number;
    isBump: boolean;
  }) => {
    const cleanUrl = productUrl.trim().toLowerCase().replace(/\/$/, '');
    const existingIndex = products.findIndex(
      (p) => p.url.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
    );

    let updatedList: ProductEntry[] = [];
    let updatedProduct: ProductEntry;

    if (existingIndex !== -1) {
      // Bump existing product: add bidAmount to cumulative spend
      const current = products[existingIndex];
      updatedProduct = {
        ...current,
        name: productName || current.name,
        tagline: tagline || current.tagline,
        logo: logo || current.logo,
        category: category || current.category,
        allTimeSpend: current.allTimeSpend + bidAmount,
        todaySpend: current.todaySpend + bidAmount,
        recentBidDelta: bidAmount,
        rankDelta: 2, // simulated climb
      };
      updatedList = [...products];
      updatedList[existingIndex] = updatedProduct;
    } else {
      // New product entering the leaderboard
      updatedProduct = {
        id: `prod-${Date.now()}`,
        name: productName,
        tagline: tagline || 'Built for modern builders',
        url: productUrl,
        logo: logo || '🚀',
        category,
        allTimeSpend: bidAmount,
        todaySpend: bidAmount,
        createdAt: Date.now(), // timestamp for tie-breaker rule
        recentBidDelta: bidAmount,
        rankDelta: 1,
        clicks: Math.floor(Math.random() * 50) + 10,
        description: tagline,
        verified: true,
      };
      updatedList = [updatedProduct, ...products];
    }

    // Re-sort according to financial hierarchy & tie-breaker rule
    const sorted = sortLeaderboard(updatedList, board);
    setProducts(sorted);

    // Add to activity stream
    const newActivity: BidActivity = {
      id: `act-${Date.now()}`,
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      amount: bidAmount,
      targetRank,
      timestamp: Date.now(),
      isBump,
    };
    const updatedActs = [newActivity, ...activities.slice(0, 19)];
    setActivities(updatedActs);

    saveState(sorted, updatedActs);
    triggerConfetti();
  };

  const totalCapitalAllTime = products.reduce((acc, p) => acc + p.allTimeSpend, 0);
  const totalCapitalToday = products.reduce((acc, p) => acc + p.todaySpend, 0);

  return (
    <div className="min-h-screen bg-mesh-dark text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-zinc-950">
      {/* Top Navbar */}
      <Navbar
        onOpenBidModal={handleOpenBidModal}
        totalVolume={totalCapitalAllTime}
        totalProducts={products.length}
      />

      {/* Real-time Outbid Activity Ticker */}
      <ActivityTicker
        activities={activities}
        onSelectRank={(rank) => handleOpenBidModal(rank)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        {/* HERO SECTION */}
        <section className="relative rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-zinc-950 p-6 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Subtle background glow spheres */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-700/80 px-4 py-1.5 text-xs font-semibold text-zinc-300 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-amber-400 font-bold">Pure Financial Bidding</span>
              <span className="text-zinc-600">•</span>
              <span>Zero Algorithms • Zero Upvotes</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              The Leaderboard Run by{' '}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent underline decoration-amber-500/30">
                Capital
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Every rank on this board is earned by financial commitment.
              Want spot <strong className="text-white">#1</strong>? Outbid the current leader by <strong className="text-amber-400">+$5</strong>.
              Already on the board? Bump your spot by paying only the difference.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => handleOpenBidModal(1)}
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-3.5 text-sm font-black text-zinc-950 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
              >
                <Sparkles className="h-4 w-4 fill-zinc-950" />
                <span>Claim #1 Spot Today</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>

              <Link
                href="/campaigns"
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 px-5 py-3.5 text-sm font-bold transition hover:border-emerald-500/40"
              >
                <Megaphone className="h-4 w-4 text-emerald-400" />
                <span>Creator Campaigns</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  Earn
                </span>
              </Link>
            </div>

            {/* Key stats cards row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-zinc-800/80">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Total Deployed
                </span>
                <div className="text-lg sm:text-xl font-mono font-black text-amber-400">
                  ${totalCapitalAllTime.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  24h Volume
                </span>
                <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                  ${totalCapitalToday.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Min #1 Outbid
                </span>
                <div className="text-lg sm:text-xl font-mono font-black text-white">
                  +$5.00
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Tie-Breaker
                </span>
                <div className="text-lg sm:text-xl font-mono font-black text-sky-400">
                  Older Wins
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE CORE LEADERBOARD */}
        <section>
          <Leaderboard
            products={products}
            board={board}
            setBoard={setBoard}
            onClaimRank={(targetRank, url) => handleOpenBidModal(targetRank, url)}
          />
        </section>

        {/* CREATOR CAMPAIGN DISCOVERY BANNER */}
        <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/30 shrink-0">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  New Portal
                </span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
                  $22,000+ Available Pools
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                Are you a Content Creator or Tech Influencer?
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                Top products on this leaderboard are funding active creator campaigns. Test tools, record walkthroughs, or publish reviews on YouTube, TikTok, and X to claim cash rewards.
              </p>
            </div>
          </div>

          <Link
            href="/campaigns"
            className="rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black px-6 py-3 text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap shadow-lg shadow-emerald-500/20"
          >
            <span>Browse Creator Campaigns</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* HOW IT WORKS / RULES SECTION */}
        <HowItWorks />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/90 py-10 px-4 text-xs text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <div>
              <p className="text-[11px] text-zinc-500">Pure Financial Product Discovery & Creator Bounty Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/" className="hover:text-amber-400 transition">
              Leaderboard
            </Link>
            <Link href="/campaigns" className="hover:text-emerald-400 transition">
              Creator Campaigns
            </Link>
            <a href="#how-it-works" className="hover:text-white transition">
              Protocol Rules
            </a>
          </div>

          <div className="text-right text-[11px] text-zinc-500">
            All bids settled directly • Ties resolved by listing timestamp
          </div>
        </div>
      </footer>

      {/* INTERACTIVE BID MODAL */}
      <ClaimRankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTargetRank={modalTargetRank}
        initialProductUrl={modalProductUrl}
        board={board}
        products={products}
        onPlaceBid={handlePlaceBid}
      />
    </div>
  );
}
