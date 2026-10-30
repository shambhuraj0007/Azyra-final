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
  Megaphone,
  Rocket
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import ClaimRankModal from '../components/ClaimRankModal';
import AzyraLogo from '../components/AzyraLogo';
import CinematicCanvas from '../components/CinematicCanvas';
import { INITIAL_PRODUCTS, INITIAL_ACTIVITIES, sortLeaderboard, calculateProductTodaySpend, isPaymentToday } from '../lib/data';
import { ProductEntry, BoardType, BidActivity, PaymentRecord } from '../lib/types';
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

  // Hydrate from localStorage if available, ensuring todaySpend is calculated from payment dates
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('outbid_products');
      if (savedProducts) {
        const parsed: ProductEntry[] = JSON.parse(savedProducts);
        // Date of payment is strictly used to evaluate today's payment; all-time uses cumulative paid amount
        const refreshed = parsed.map((p) => ({
          ...p,
          todaySpend: calculateProductTodaySpend(p),
        }));
        setProducts(refreshed);
      } else {
        setProducts(
          INITIAL_PRODUCTS.map((p) => ({
            ...p,
            todaySpend: calculateProductTodaySpend(p),
          }))
        );
      }

      // Sync click metrics from database
      fetch('/api/products/click')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.clicks) {
            setProducts((prev) =>
              prev.map((p) => {
                const dbClicks = data.clicks[p.id];
                if (typeof dbClicks === 'number') {
                  return { ...p, clicks: Math.max(p.clicks || 0, dbClicks) };
                }
                return p;
              })
            );
          }
        })
        .catch(() => {});

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


  const handleTrackClick = (product: ProductEntry) => {
    if (!product?.id) return;
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === product.id ? { ...p, clicks: (p.clicks || 0) + 1 } : p
      );
      try {
        localStorage.setItem('outbid_products', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Persist to MongoDB database
    fetch('/api/products/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productUrl: product.url,
        productName: product.name,
      }),
      keepalive: true,
    }).catch((err) => {
      console.warn('Failed to record click in DB:', err);
    });
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

  // Process a new bid or bump: date of payment is tracked for today, total paid amount for all-time
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
    const now = Date.now();
    const newPaymentRecord: PaymentRecord = {
      amount: bidAmount,
      timestamp: now,
    };

    // Record old ranks before outbid to compute exact rank delta indicators
    const oldRanks = new Map<string, number>();
    products.forEach((p, idx) => {
      oldRanks.set(p.id, idx + 1);
    });

    if (existingIndex !== -1) {
      // Bump existing product: add bidAmount to allTimeSpend, and use date of payment to compute today's payment
      const current = products[existingIndex];
      const existingPayments = current.payments || [];
      const updatedPayments = [...existingPayments, newPaymentRecord];
      const updatedTodaySpend = updatedPayments
        .filter((p) => isPaymentToday(p.timestamp))
        .reduce((sum, p) => sum + p.amount, 0);

      updatedProduct = {
        ...current,
        name: productName || current.name,
        tagline: tagline || current.tagline,
        logo: logo || current.logo,
        category: category || current.category,
        allTimeSpend: current.allTimeSpend + bidAmount, // All-time uses cumulative paid amount
        todaySpend: updatedTodaySpend,                 // Date of payment is used to track today's payment
        lastPaymentDate: now,
        payments: updatedPayments,
        recentBidDelta: bidAmount,
      };
      updatedList = [...products];
      updatedList[existingIndex] = updatedProduct;
    } else {
      // New product entering the leaderboard
      updatedProduct = {
        id: `prod-${now}`,
        name: productName,
        tagline: tagline || 'Built for modern builders',
        url: productUrl,
        logo: logo || '🚀',
        category,
        allTimeSpend: bidAmount, // Total paid amount
        todaySpend: bidAmount,   // Date of payment is today
        lastPaymentDate: now,
        payments: [newPaymentRecord],
        createdAt: now, // timestamp for tie-breaker rule
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
      id: `act-${now}`,
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      amount: bidAmount,
      targetRank,
      timestamp: now,
      isBump,
    };
    const updatedActs = [newActivity, ...activities.slice(0, 19)];
    setActivities(updatedActs);

    saveState(finalized, updatedActs);
    handleAddUserStartup(productUrl);
    triggerConfetti();
  };

  const totalCapitalAllTime = products.reduce((acc, p) => acc + (p.allTimeSpend || 0), 0);
  const totalCapitalToday = products.reduce((acc, p) => acc + calculateProductTodaySpend(p), 0);

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

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 pb-8 sm:pt-4 sm:pb-12 space-y-4 sm:space-y-5">
        {/* HERO SECTION */}
        <section className="card-craft relative w-full rounded-2xl py-5 px-5 sm:py-6 sm:px-8 overflow-hidden shadow-2xl">
          {/* Subtle inner radial glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[220px] w-[460px] rounded-full bg-limeAccent/[0.08] blur-[90px]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center gap-2.5 sm:gap-3">
            {/* Editorial Serif Contrast Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold tracking-tight text-textMain leading-[1.16]">
              Stop waiting on algorithms.<br className="hidden sm:block" />
              <span className="font-serif italic font-normal text-limeAccent"> Own your visibility.</span>
            </h1>

            {/* Cleaner, elegant sub-copy */}
            <p className="text-xs sm:text-sm text-textMuted max-w-lg font-sans leading-relaxed">
              No fake upvotes or shadowbans. Just guaranteed exposure. Outbid the leader to claim the top spot and climb.
            </p>

            {/* ReleaseStack-styled interactive pill buttons */}
            <div className="flex flex-row items-center justify-center gap-2.5 pt-0.5 w-auto">
              <button
                onClick={() => handleOpenBidModal(1)}
                className="group relative flex items-center justify-center gap-2 rounded-full bg-limeAccent px-4.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-heading font-bold text-[#070B0C] transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-md shadow-limeAccent/20 hover:shadow-limeAccent/30"
              >
                <Sparkles className="h-3.5 w-3.5 fill-[#070B0C]" />
                <span>Claim the #1 Spot</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </button>

              <Link
                href="/campaigns"
                className="group flex items-center justify-center gap-2 rounded-full border border-borderMuted bg-surfaceElevated/60 px-4.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-heading font-medium text-textMain transition-all duration-200 hover:border-emeraldAccent/40 hover:bg-surfaceElevated active:scale-[0.98] backdrop-blur-sm"
              >
                <Megaphone className="h-3.5 w-3.5 text-emeraldAccent transition-transform group-hover:-rotate-12" />
                <span>Earn as a Creator</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
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
            onTrackClick={handleTrackClick}
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

        {/* PRODUCT LAUNCH & HYPE PACKAGES BANNER */}
        <section className="relative overflow-hidden rounded-3xl border border-limeAccent/30 bg-gradient-to-r from-surface via-surfaceElevated to-surface p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-limeAccent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-limeAccent/15 px-3 py-1 text-xs font-mono font-bold text-limeAccent border border-limeAccent/30">
                <Rocket className="h-3.5 w-3.5 text-limeAccent" />
                <span>Launching a Product?</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-textMain tracking-tight">
                Dominate Launch Day & Create <span className="text-limeAccent">Market Hype</span>
              </h3>
              <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
                Unlock turnkey creator syndication, guaranteed leaderboard placement, and viral video reach. Discover our launch packages engineered to turn your launch into an industry event.
              </p>
            </div>

            <Link
              href="/launch"
              className="group rounded-full bg-limeAccent hover:brightness-110 text-[#070B0C] font-heading font-bold px-7 py-3.5 text-xs sm:text-sm flex items-center gap-2.5 transition whitespace-nowrap shadow-xl shadow-limeAccent/25 shrink-0 active:scale-[0.98]"
            >
              <span>Explore Launch Packages</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
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
            <Link href="/launch" className="hover:text-limeAccent transition">
              Launch Packages
            </Link>
            <Link href="/terms" className="hover:text-limeAccent transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-limeAccent transition">
              Privacy
            </Link>
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
