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
import CinematicCanvas from '../components/CinematicCanvas';
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
  const [modalProductName, setModalProductName] = useState('');
  const [userStartupUrls, setUserStartupUrls] = useState<string[]>([]);

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
      const savedStartups = localStorage.getItem('azyra_user_startups');
      if (savedStartups) {
        setUserStartupUrls(JSON.parse(savedStartups));
      }

      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('claim') === '1') {
          setIsModalOpen(true);
          setModalTargetRank(1);
        } else if (urlParams.get('outbid_success') === '1' || urlParams.get('rank')) {
          const targetRankNum = parseInt(urlParams.get('rank') || '1', 10);
          setTimeout(() => {
            const targetEl = document.getElementById(`rank-${targetRankNum}`);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            triggerConfetti();
          }, 350);
        } else if (window.location.hash && window.location.hash.startsWith('#rank-')) {
          setTimeout(() => {
            const targetEl = document.querySelector(window.location.hash);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 350);
        }
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

  const handleOpenBidModal = (
    targetRank: number = 1,
    productUrl: string = '',
    productName: string = ''
  ) => {
    setModalTargetRank(targetRank);
    setModalProductUrl(productUrl);
    setModalProductName(productName);
    setIsModalOpen(true);
  };

  const handleAddUserStartup = (url: string) => {
    const clean = url.trim().toLowerCase().replace(/\/$/, '');
    if (!clean) return;
    setUserStartupUrls((prev) => {
      const updated = Array.from(new Set([...prev, clean]));
      try {
        localStorage.setItem('azyra_user_startups', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
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

    // Record old ranks before outbid to compute exact rank delta indicators
    const oldRanks = new Map<string, number>();
    products.forEach((p, idx) => {
      oldRanks.set(p.id, idx + 1);
    });

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
        clicks: Math.floor(Math.random() * 50) + 10,
        description: tagline,
        verified: true,
      };
      updatedList = [updatedProduct, ...products];
    }

    // Re-sort according to financial hierarchy & tie-breaker rule
    const sorted = sortLeaderboard(updatedList, board);

    // Compute dynamic rankDelta (+1, -1, 0) for each product
    const finalized = sorted.map((p, newIdx) => {
      const newRank = newIdx + 1;
      const oldRank = oldRanks.get(p.id);
      const rankDelta = oldRank !== undefined ? oldRank - newRank : 1;
      return {
        ...p,
        rankDelta,
      };
    });

    setProducts(finalized);

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

    saveState(finalized, updatedActs);
    handleAddUserStartup(productUrl);
    triggerConfetti();
  };

  const totalCapitalAllTime = products.reduce((acc, p) => acc + p.allTimeSpend, 0);
  const totalCapitalToday = products.reduce((acc, p) => acc + p.todaySpend, 0);

  return (
    <div className="relative min-h-screen bg-canvas text-textMain flex flex-col selection:bg-limeAccent selection:text-[#000000] font-sans">
      {/* High-Performance 60fps Animated 3D Wave & Aurora Background */}
      <CinematicCanvas />

      {/* Top Navbar */}
      <Navbar
        onOpenBidModal={handleOpenBidModal}
        totalVolume={totalCapitalAllTime}
        totalProducts={products.length}
      />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-12">
        {/* HERO SECTION */}
        <section className="card-craft relative w-full rounded-3xl p-6 sm:p-12 overflow-hidden shadow-2xl">
          {/* Subtle inner radial glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[560px] rounded-full bg-limeAccent/[0.08] blur-[110px]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center gap-6">


            {/* Editorial Serif Contrast Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-textMain leading-[1.12]">
              Stop waiting on algorithms.<br className="hidden sm:block" />
              <span className="font-serif italic font-normal text-limeAccent"> Own your visibility.</span>
            </h1>

            {/* Cleaner, elegant sub-copy */}
            <p className="text-sm sm:text-base text-textMuted max-w-xl font-sans leading-relaxed">
              No fake upvotes or shadowbans. Just guaranteed exposure. Outbid the leader to claim the top spot and climb.
            </p>

            {/* ReleaseStack-styled interactive pill buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto">
              <button
                onClick={() => handleOpenBidModal(1)}
                className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-limeAccent px-6 py-3 text-sm font-heading font-bold text-[#070B0C] transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg shadow-limeAccent/20 hover:shadow-limeAccent/30"
              >
                <Sparkles className="h-4 w-4 fill-[#070B0C]" />
                <span>Claim the #1 Spot</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </button>

              <Link
                href="/campaigns"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-borderMuted bg-surfaceElevated/60 px-6 py-3 text-sm font-heading font-medium text-textMain transition-all duration-200 hover:border-emeraldAccent/40 hover:bg-surfaceElevated active:scale-[0.98] backdrop-blur-sm"
              >
                <Megaphone className="h-4 w-4 text-emeraldAccent transition-transform group-hover:-rotate-12" />
                <span>Earn as a Creator</span>
                <ArrowRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
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
            onClaimRank={(targetRank, url, name) => handleOpenBidModal(targetRank, url, name)}
            userStartupUrls={userStartupUrls}
            onAddUserStartup={handleAddUserStartup}
          />
        </section>

        {/* CREATOR CAMPAIGN DISCOVERY BANNER */}
        <section className="card-craft rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-limeAccent text-[#070B0C] font-heading font-bold shadow-lg shadow-limeAccent/20 shrink-0">
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-limeAccent bg-limeAccent/10 px-2 py-0.5 rounded-full border border-limeAccent/20">
                  Creator Economy
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-textMain">
                Are you a Content Creator or Tech Influencer?
              </h3>
              <p className="text-xs text-textMuted max-w-xl leading-relaxed">
                Top products on this leaderboard fund active creator campaigns. Test tools, record walkthroughs, or publish reviews on X, YouTube, and TikTok to claim cash rewards.
              </p>
            </div>
          </div>

          <Link
            href="/campaigns"
            className="group rounded-full bg-limeAccent hover:brightness-110 text-[#070B0C] font-heading font-bold px-6 py-3 text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap shadow-lg shadow-limeAccent/20 active:scale-[0.98]"
          >
            <span>Browse Creator Campaigns</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>

        {/* HOW IT WORKS / RULES SECTION */}
        <HowItWorks />
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-borderMuted bg-canvas/80 backdrop-blur-md py-10 px-4 text-xs text-textMuted mt-12">
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
        initialProductName={modalProductName}
        board={board}
        products={products}
        onPlaceBid={handlePlaceBid}
      />
    </div>
  );
}
