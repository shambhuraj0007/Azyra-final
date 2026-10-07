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

      if (typeof window !== 'undefined' && window.location.search.includes('claim=1')) {
        setIsModalOpen(true);
        setModalTargetRank(1);
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
    <div className="min-h-screen bg-canvas text-textMain flex flex-col selection:bg-limeAccent selection:text-[#0B0F10] font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenBidModal={handleOpenBidModal}
        totalVolume={totalCapitalAllTime}
        totalProducts={products.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        {/* HERO SECTION */}
        <section className="relative w-full rounded-3xl border border-borderMuted bg-surface p-6 sm:p-10 shadow-xl overflow-hidden">
          {/* Tighter, softer ambient glow that doesn't overpower the screen */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-limeAccent/5 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center gap-5">
            {/* Sleeker, smaller Pill Badge */}


            {/* Sharper, refined headline (smaller text size, cleaner font weight) */}
            <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-textMain leading-[1.15]">
              Stop Waiting on Algorithms.<br className="hidden sm:block" />
              <span className="text-limeAccent"> Own Your Visibility.</span>
            </h1>

            {/* Cleaner paragraph font size */}
            <p className="text-sm sm:text-base text-textMuted max-w-xl font-sans leading-relaxed">
              No fake upvotes or shadowbans. Just guaranteed exposure. Outbid the leader to take the top spot and climb.
            </p>

            {/* Compact, modern buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 w-full sm:w-auto">
              <button
                onClick={() => handleOpenBidModal(1)}
                className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-limeAccent px-6 py-3 text-sm font-heading font-bold text-[#0B0F10] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 fill-[#0B0F10]" />
                <span>Claim the #1 Spot</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/campaigns"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-borderMuted bg-surfaceElevated/40 px-6 py-3 text-sm font-heading font-medium text-textMain transition-all duration-200 hover:border-limeAccent/30 hover:bg-surfaceElevated active:scale-[0.98]"
              >
                <Megaphone className="h-4 w-4 text-emeraldAccent transition-transform group-hover:-rotate-12" />
                <span>Earn as a Creator</span>
              </Link>
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
        <section className="rounded-xl border border-borderMuted bg-surface p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-lg shadow-limeAccent/20 shrink-0">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-limeAccent">
                  New Portal
                </span>

              </div>
              <h3 className="text-xl font-heading font-bold text-textMain">
                Are you a Content Creator or Tech Influencer?
              </h3>
              <p className="text-xs text-textMuted max-w-xl">
                Top products on this leaderboard are funding active creator campaigns. Test tools, record walkthroughs, or publish reviews on X (Twitter), YouTube Shorts, and Instagram Reels to claim cash rewards.
              </p>
            </div>
          </div>

          <Link
            href="/campaigns"
            className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-3 text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap shadow-lg shadow-limeAccent/20 active:scale-[0.98]"
          >
            <span>Browse Creator Campaigns</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* HOW IT WORKS / RULES SECTION */}
        <HowItWorks />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-borderMuted bg-canvas py-10 px-4 text-xs text-textMuted mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <div>
              <p className="text-[11px] text-textMuted">Pure Financial Product Discovery & Creator Bounty Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-textMuted">
            <Link href="/" className="hover:text-limeAccent transition">
              Leaderboard
            </Link>
            <Link href="/campaigns" className="hover:text-emeraldAccent transition">
              Creator Campaigns
            </Link>
            <a href="#how-it-works" className="hover:text-textMain transition">
              Protocol Rules
            </a>
          </div>

          <div className="text-right text-[11px] text-textMuted font-mono">
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
