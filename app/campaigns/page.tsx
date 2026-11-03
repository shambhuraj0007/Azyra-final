'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Megaphone,
  Trophy,
  Users,
  Video,
  Layers,
  Eye,
  Plus,
  ArrowUpRight,
  Check,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import CreateCampaignModal from '../../components/CreateCampaignModal';
import WithdrawModal from '../../components/WithdrawModal';
import { useCampaigns } from '../../lib/CampaignContext';
import { SocialPlatform, Campaign } from '../../lib/types';
import { formatPlatform } from '../../lib/campaignUtils';
import AzyraLogo from '../../components/AzyraLogo';
import { toast } from '@/lib/toast';

export default function CampaignsMarketplacePage() {
  const router = useRouter();
  const {
    currentUser,
    campaigns,
    isJoined,
    joinCampaign,
    openSetupModal,
  } = useCampaigns();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'highest_cpm' | 'budget_left' | 'views' | 'newest'>('highest_cpm');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const handleOpenCreateCampaign = () => {
    if (!currentUser?.isLoggedIn) {
      router.push('/login?redirect=/campaigns&action=create');
      return;
    }
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'create' && currentUser?.isLoggedIn) {
        setIsCreateModalOpen(true);
        window.history.replaceState({}, '', '/campaigns');
      } else if (params.get('escrow_success') === '1' || params.get('created') === '1') {
        toast.success('Campaign Live', 'Your campaign escrow is funded and accepting creator submissions.');
        setSortBy('newest');
        setSelectedType('all');
        setSelectedPlatform('All');
        setSelectedCategory('All');
        window.history.replaceState({}, '', '/campaigns');
      }
    }
  }, [currentUser?.isLoggedIn]);

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

  const totalEscrowPool = campaigns.reduce((acc, c) => acc + c.remaining_budget, 0);
  const totalViewsTracked = campaigns.reduce((acc, c) => acc + c.total_views_tracked, 0);

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((camp) => {
        const matchesType =
          selectedType === 'all' ||
          (selectedType === 'cpm_pool' && (camp.execution_type === 'cpm_pool' || !camp.execution_type)) ||
          (selectedType === 'creator_direct' && (camp.execution_type === 'creator_direct' || camp.execution_type === 'flat_bounty' || (camp as any).execution_type === 'custom_bounty'));
        const matchesPlatform =
          selectedPlatform === 'All' ||
          (Array.isArray(camp.platforms) && camp.platforms.includes(selectedPlatform as SocialPlatform));
        const matchesCategory =
          selectedCategory === 'All' || camp.category === selectedCategory;
        const matchesSearch =
          camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesType && matchesPlatform && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_cpm') {
          const rateA = a.execution_type === 'creator_direct' ? (a.flat_rate || 500) : a.execution_type === 'flat_bounty' ? (a.bounty_rate || 0.5) * 1000 : (a.cpm_rate || 1);
          const rateB = b.execution_type === 'creator_direct' ? (b.flat_rate || 500) : b.execution_type === 'flat_bounty' ? (b.bounty_rate || 0.5) * 1000 : (b.cpm_rate || 1);
          return rateB - rateA;
        }
        if (sortBy === 'budget_left') return b.remaining_budget - a.remaining_budget;
        if (sortBy === 'views') return b.total_views_tracked - a.total_views_tracked;
        return b.created_at - a.created_at;
      });
  }, [campaigns, selectedType, selectedPlatform, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* HERO BANNER: Premium Creator Marketplace Header */}
        <div className="card-terminal p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-md bg-surfaceElevated px-2.5 py-1 text-[11px] font-sans font-semibold text-textMuted border border-borderMuted">
                <span className="h-1.5 w-1.5 rounded-full bg-iceBlue" />
                <span>PERFORMANCE CREATOR ESCROW EXCHANGE</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight text-textMain leading-[1.15]">
                Syndicate Short-Form Reach. <br className="hidden sm:block" />
                Earn Verified CPM & Custom Bounties.
              </h1>

              <p className="text-xs sm:text-sm text-textMuted leading-relaxed max-w-xl">
                Founders fund escrow vaults with algorithmic payout rates. Creators publish organic video hooks to X, Reels, and Shorts, unlocking automated payouts verified by view metrics.
              </p>
            </div>

            {/* Quick Metrics & Launch CTA */}
            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
              <div className="flex items-center gap-4 rounded-md border border-borderMuted bg-surfaceElevated px-4 py-2.5">
                <div>
                  <span className="text-[10px] uppercase font-sans text-textMuted block">Active Escrow</span>
                  <strong className="text-sm font-mono-numbers text-emeraldAccent font-bold">${totalEscrowPool.toLocaleString()}</strong>
                </div>
                <div className="h-6 w-px bg-borderMuted" />
                <div>
                  <span className="text-[10px] uppercase font-sans text-textMuted block">Views Tracked</span>
                  <strong className="text-sm font-mono-numbers text-textMain font-bold">{(totalViewsTracked / 1000000).toFixed(1)}M+</strong>
                </div>
              </div>

              <button
                onClick={handleOpenCreateCampaign}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-limeAccent px-4.5 py-2.5 text-xs sm:text-sm font-heading font-bold text-[#090A0C] transition hover:brightness-105 active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Launch Campaign</span>
              </button>
            </div>
          </div>
        </div>

        {/* WORK STYLE ARCHETYPE SELECTOR */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface border border-borderMuted rounded-md p-1">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`cursor-pointer flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-heading font-medium transition ${
              selectedType === 'all'
                ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Deals</span>
            <span className="text-[10px] font-mono-numbers text-textMuted font-medium">({campaigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('cpm_pool')}
            className={`cursor-pointer flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-heading font-medium transition ${
              selectedType === 'cpm_pool'
                ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <Video className="h-3.5 w-3.5 text-textMuted" />
            <span>Pay-Per-View CPM</span>
            <span className="text-[10px] font-mono-numbers text-textMuted font-medium">
              ({campaigns.filter((c) => (c.execution_type || 'cpm_pool') === 'cpm_pool').length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('creator_direct')}
            className={`cursor-pointer flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-heading font-medium transition ${
              selectedType === 'creator_direct'
                ? 'bg-surfaceElevated text-textMain font-bold border border-borderStrong'
                : 'text-textMuted hover:text-textMain'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-iceBlue" />
            <span>Direct Sponsorships</span>
            <span className="text-[10px] font-mono-numbers text-textMuted font-medium">
              ({campaigns.filter((c) => c.execution_type === 'creator_direct' || c.execution_type === 'flat_bounty' || (c as any).execution_type === 'custom_bounty').length})
            </span>
          </button>
        </div>

        {/* SEARCH & CATEGORY ROW */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
            <input
              type="text"
              placeholder="Search campaigns, brands, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-surface border border-borderMuted pl-8.5 pr-3 py-1.5 text-xs text-textMain placeholder:text-textMuted/60 focus:outline-none focus:border-borderStrong transition"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
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

        {/* CAMPAIGN CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((camp) => {
            const joined = isJoined(camp.id);
            const budgetPercent = Math.max(
              0,
              Math.min(100, (camp.remaining_budget / camp.total_budget) * 100)
            );

            const isDirect = camp.execution_type === 'creator_direct' || camp.execution_type === 'flat_bounty';
            const rateHighlight = isDirect
              ? `$${camp.flat_rate?.toLocaleString() || camp.bounty_rate?.toLocaleString() || '500'} / Deal`
              : `$${camp.cpm_rate?.toFixed(2) || '1.00'} / 1K views`;

            return (
              <div
                key={camp.id}
                className="card-terminal p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Brand Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas border border-borderMuted text-base shrink-0">
                        {camp.brand_logo}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-bold text-sm text-textMain truncate">
                            {camp.brand_name}
                          </span>
                          {camp.brand_leaderboard_rank && (
                            <span className="rounded bg-surfaceElevated px-1.5 py-0.2 text-[9px] font-mono-numbers text-textMuted border border-borderMuted">
                              #{camp.brand_leaderboard_rank}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-textMuted block">
                          {camp.category} • {isDirect ? 'Direct Retainer' : 'CPM Pool'}
                        </span>
                      </div>
                    </div>

                    <span className="rounded bg-surfaceElevated px-2 py-0.5 text-[10px] font-sans font-medium text-textMuted border border-borderMuted">
                      {camp.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-heading font-bold text-textMain mb-1 line-clamp-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-textMuted line-clamp-2 mb-3 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* Platforms */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {(Array.isArray(camp.platforms) ? camp.platforms : []).map((p) => {
                      const platMeta = formatPlatform(p);
                      return (
                        <span
                          key={p}
                          className="rounded bg-surfaceElevated px-2 py-0.5 text-[10px] font-sans text-textMuted border border-borderMuted"
                        >
                          {platMeta.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Financial Rate Box */}
                  <div className="rounded-md bg-surfaceElevated p-2.5 mb-3 flex items-center justify-between border border-borderMuted">
                    <span className="text-[10px] uppercase font-sans text-textMuted">
                      {isDirect ? 'Retainer Payout' : 'CPM Reward'}
                    </span>
                    <span className="text-xs font-mono-numbers font-bold text-textMain">
                      {rateHighlight}
                    </span>
                  </div>
                </div>

                {/* Footer / Progress & Action */}
                <div className="space-y-2 pt-2 border-t border-borderMuted">
                  <div className="flex items-center justify-between text-[11px] text-textMuted font-mono-numbers">
                    <span>${camp.remaining_budget.toLocaleString()} left</span>
                    <span>{budgetPercent.toFixed(0)}% Escrow</span>
                  </div>

                  <div className="h-1 w-full bg-surfaceElevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emeraldAccent rounded-full"
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="flex-1 rounded-md bg-surfaceElevated hover:bg-surface border border-borderMuted hover:border-borderStrong text-textMain font-heading font-medium py-1.5 text-xs flex items-center justify-center gap-1 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-textMuted" />
                      <span>Details</span>
                    </Link>

                    {!joined ? (
                      <button
                        onClick={() => {
                          if (!currentUser?.isLoggedIn) {
                            router.push(`/login?redirect=/campaigns&join=${camp.id}`);
                            return;
                          }
                          const res = joinCampaign(camp.id);
                          if (!res.success) {
                            openSetupModal(camp.id);
                          }
                        }}
                        className="rounded-md bg-limeAccent hover:brightness-105 text-[#090A0C] font-heading font-bold px-3 py-1.5 text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>Join</span>
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="rounded-md bg-surfaceElevated text-emeraldAccent border border-borderMuted px-2.5 py-1.5 text-xs font-heading font-medium flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-borderMuted bg-surface/60 py-6 px-4 text-xs text-textMuted mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <span className="text-[11px] text-textMuted">Short-Form Creator Escrow Protocol</span>
          </div>
          <div className="flex items-center gap-5 text-textMuted text-[11px]">
            <Link href="/" className="hover:text-textMain transition">Leaderboard</Link>
            <Link href="/campaigns" className="hover:text-textMain transition">Campaigns</Link>
            <Link href="/terms" className="hover:text-textMain transition">Terms</Link>
            <Link href="/privacy" className="hover:text-textMain transition">Privacy</Link>
          </div>
        </div>
      </footer>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
}
