'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Megaphone,
  Rocket,
  CheckCircle2
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

  const [nowTimestamp, setNowTimestamp] = useState<number | undefined>(undefined);

  // Hydrate from localStorage
  useEffect(() => {
    const currentNow = Date.now();
    setNowTimestamp(currentNow);
    try {
      const savedProducts = localStorage.getItem('outbid_products');
      if (savedProducts) {
        const parsed: ProductEntry[] = JSON.parse(savedProducts);
        const refreshed = parsed.map((p) => ({
          ...p,
          todaySpend: calculateProductTodaySpend(p, currentNow),
        }));
        setProducts(refreshed);
      } else {
        setProducts(
          INITIAL_PRODUCTS.map((p) => ({
            ...p,
            todaySpend: calculateProductTodaySpend(p, currentNow),
          }))
        );
      }

      // Sync click metrics
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
        .catch(() => { });

      const savedStartups = localStorage.getItem('azyra_user_startups');
      if (savedStartups) {
        const parsedUrls = JSON.parse(savedStartups);
        if (Array.isArray(parsedUrls)) {
          setUserStartupUrls(parsedUrls);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleTrackClick = async (product: ProductEntry) => {
    try {
      fetch('/api/products/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      }).catch(() => { });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, clicks: (p.clicks || 0) + 1 } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBidModal = (targetRank: number = 1, productUrl: string = '', productName: string = '') => {
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

    if (existingIndex !== -1) {
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
        allTimeSpend: current.allTimeSpend + bidAmount,
        todaySpend: updatedTodaySpend,
        lastPaymentDate: now,
        payments: updatedPayments,
        recentBidDelta: bidAmount,
      };
      updatedList = [...products];
      updatedList[existingIndex] = updatedProduct;
    } else {
      updatedProduct = {
        id: `prod-${now}`,
        name: productName,
        tagline: tagline || 'Built for modern builders',
        url: productUrl,
        logo: logo || '🚀',
        category,
        allTimeSpend: bidAmount,
        todaySpend: bidAmount,
        createdAt: now,
        lastPaymentDate: now,
        payments: [newPaymentRecord],
        recentBidDelta: bidAmount,
        clicks: 0,
        description: tagline || 'Modern tech solution',
      };
      updatedList = [updatedProduct, ...products];
    }

    const reSorted = sortLeaderboard(updatedList, board);
    setProducts(reSorted);
    try {
      localStorage.setItem('outbid_products', JSON.stringify(reSorted));
    } catch (e) {
      console.error(e);
    }

    const newActivity: BidActivity = {
      id: `act-${now}`,
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      amount: bidAmount,
      targetRank,
      timestamp: now,
      isBump,
    };
    const updatedActivities = [newActivity, ...activities.slice(0, 19)];
    setActivities(updatedActivities);
    try {
      localStorage.setItem('outbid_activities', JSON.stringify(updatedActivities));
    } catch (e) {
      console.error(e);
    }

    if (targetRank === 1) {
      triggerConfetti();
    }
  };

  const totalCapitalAllTime = products.reduce((acc, p) => acc + (p.allTimeSpend || 0), 0);

  return (
    <div className="relative min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* 60fps Subtle Visual Grid Background */}
      <CinematicCanvas />

      {/* Top Navbar */}
      <Navbar
        onOpenBidModal={handleOpenBidModal}
        totalVolume={totalCapitalAllTime}
        totalProducts={products.length}
      />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 pb-12 space-y-6">
        {/* HERO SECTION: Authoritative Financial Header */}
        <section className="card-terminal p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-md bg-surfaceElevated px-3 py-1.5 text-xs font-sans font-semibold text-textMuted border border-borderMuted">
                <span className="h-2 w-2 rounded-full bg-limeAccent" />
                <span>OPEN FINANCIAL BIDDING LEDGER</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight text-textMain leading-[1.15]">
                Capital-Weighted Discovery. <br className="hidden sm:block" />
                Guaranteed Audience Reach.
              </h1>

              <p className="text-sm sm:text-base text-textMuted leading-relaxed max-w-xl font-normal">
                No opaque algorithms or artificial voting rings. Startups secure sovereign exposure through open financial bidding, while syndicated creators distribute short-form content with verified escrow payouts.
              </p>
            </div>

            {/* Quick Metrics & Direct Bidding Trigger */}
            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
              <button
                onClick={() => handleOpenBidModal(1)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-limeAccent px-5 py-2.5 text-xs sm:text-sm font-heading font-bold text-[#090A0C] transition hover:brightness-105 active:scale-[0.98] cursor-pointer"
              >
                <span>Outbid #1 Spot</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </button>

              <Link
                href="/campaigns"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-surfaceElevated hover:bg-surface border border-borderMuted hover:border-borderStrong px-5 py-2.5 text-xs sm:text-sm font-heading font-medium text-textMain transition"
              >
                <Megaphone className="h-3.5 w-3.5 text-iceBlue" />
                <span>Creator Marketplace</span>
              </Link>
            </div>
          </div>
        </section>

        {/* THE FINANCIAL LEADERBOARD */}
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

        {/* CREATOR CAMPAIGN SYNDICATION CALLOUT */}
        <section className="card-terminal p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-iceBlue">
              Short-Form Creator Syndication
            </span>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-textMain">
              Fund Performance Escrows or Claim Active Bounties
            </h3>
            <p className="text-xs text-textMuted leading-relaxed">
              Top products fund algorithmic CPM escrow pools. Verified creators pull raw assets, produce short-form videos across TikTok, Reels, and X, and unlock automated milestone payouts.
            </p>
          </div>

          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 rounded-md bg-surfaceElevated hover:bg-surface border border-borderMuted hover:border-borderStrong text-textMain px-5 py-2.5 text-xs font-heading font-semibold transition shrink-0"
          >
            <span>Explore Creator Deals</span>
            <ArrowUpRight className="h-4 w-4 text-textMuted" />
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-borderMuted bg-surface/60 py-6 px-4 text-xs text-textMuted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <span className="text-[11px] text-textMuted">Open Financial Discovery & Escrow Protocol</span>
          </div>

          <div className="flex items-center gap-5 text-textMuted text-[11px]">
            <Link href="/" className="hover:text-textMain transition">Leaderboard</Link>
            <Link href="/campaigns" className="hover:text-textMain transition">Campaigns</Link>
            <Link href="/launch" className="hover:text-textMain transition">Launch Packages</Link>
            <Link href="/terms" className="hover:text-textMain transition">Terms</Link>
            <Link href="/privacy" className="hover:text-textMain transition">Privacy</Link>
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
