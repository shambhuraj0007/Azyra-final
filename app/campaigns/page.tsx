'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Megaphone,
  Sparkles,
  Trophy,
  Users,
  DollarSign,
  CheckCircle,
  X,
  ExternalLink,
  ArrowRight,
  Clock,
  Filter,
  Check,
  Video,
  Layers,
  Send,
  Building2,
  FolderDown,
  TrendingUp,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Archive,
  Eye,
  Plus
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
    submissions,
    participants,
    isJoined,
    joinCampaign,
    openSetupModal,
    toggleCampaignStatus,
    switchRole
  } = useCampaigns();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'highest_cpm' | 'budget_left' | 'views' | 'newest'>('highest_cpm');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Authentication guard for creating a campaign
  const handleOpenCreateCampaign = () => {
    if (!currentUser?.isLoggedIn) {
      router.push('/login?redirect=/campaigns&action=create');
      return;
    }
    setIsCreateModalOpen(true);
  };

  // If redirected back from login or payment return
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

  // Platform filters
  const platformOptions: { id: string; label: string }[] = [
    { id: 'All', label: 'All Platforms' },
    { id: 'x', label: 'X (Twitter)' },
    { id: 'instagram', label: 'Instagram Reels' },
    { id: 'youtube_shorts', label: 'YouTube Shorts' },
  ];

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

  // Total platform stats calculation
  const totalEscrowPool = campaigns.reduce((acc, c) => acc + c.remaining_budget, 0);
  const totalViewsTracked = campaigns.reduce((acc, c) => acc + c.total_views_tracked, 0);
  const totalPaidOut = campaigns.reduce((acc, c) => acc + c.total_paid_out, 0);
  const totalClippers = 142; // simulated network count

  // Filter and sort
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

  // Creator's joined campaigns
  const myJoinedCampaigns = useMemo(() => {
    return campaigns.filter((c) => isJoined(c.id));
  }, [campaigns, participants, currentUser.id]);

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* Universal Top Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* HERO SECTION & TWO-SIDED BANNER */}
        <div className="group relative overflow-hidden rounded-3xl border border-borderMuted/80 bg-gradient-to-b from-surface/95 via-surface/80 to-surface/95 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-limeAccent/30">
          {/* Ambient Mesh Glows & Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-limeAccent/15 blur-[120px] pointer-events-none transition-transform duration-1000 group-hover:scale-110 group-hover:bg-limeAccent/20" />
          <div className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-emeraldAccent/10 blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

          {/* Top Shimmer Line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-limeAccent/40 to-transparent" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Hero Pitch & CTAs */}
            <div className="space-y-6 sm:space-y-8 lg:col-span-7">
              {/* Persona Switcher / Status Pill */}


              {/* Main Headline */}
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-textMain sm:text-5xl lg:text-[3.25rem] leading-[1.12]">
                Get Paid For Views To Market{' '}
                <span className="bg-gradient-to-r from-limeAccent via-emerald-400 to-limeAccent bg-[length:200%_auto] bg-clip-text text-transparent font-black animate-pulse">
                  Top Internet Products
                </span>
              </h1>

              {/* Subtext */}
              <p className="max-w-xl text-sm leading-relaxed text-textMuted sm:text-base/relaxed lg:text-lg">
                Brands fund transparent escrow pools with algorithmic CPM rates. Creators pull raw clips, syndicate short-form content to <strong className="text-textMain font-medium">X, Reels, and Shorts</strong>, and unlock verified real-time payouts as views compound.
              </p>

              {/* Action Bar & Stats */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                <button
                  onClick={handleOpenCreateCampaign}
                  className="group/btn relative flex items-center justify-center gap-2.5 rounded-xl bg-limeAccent px-6 py-3.5 font-heading text-sm font-bold text-[#0B0F10] shadow-[0_0_24px_rgba(200,255,0,0.22)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_36px_rgba(200,255,0,0.38)] active:scale-[0.98] w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 stroke-[3] transition-transform duration-300 group-hover/btn:rotate-90" />
                  <span>Create Campaign</span>
                </button>

                <div className="flex items-center justify-around sm:justify-start gap-5 sm:gap-6 rounded-xl border border-borderMuted/70 bg-surfaceElevated/60 px-5 py-2.5 shadow-inner backdrop-blur-md transition-all duration-300 hover:border-borderMuted w-full sm:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-textMuted/80 font-semibold">
                      Active Escrow
                    </span>
                    <span className="font-mono text-base font-bold tracking-tight text-emeraldAccent">
                      ${totalEscrowPool.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-borderMuted/80" />

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-textMuted/80 font-semibold">
                      Views Tracked
                    </span>
                    <span className="font-mono text-base font-bold tracking-tight text-limeAccent">
                      {(totalViewsTracked / 1000000).toFixed(1)}M+
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Proof & Escrow Payout Simulation Card */}
            <div className="relative lg:col-span-5 flex items-center justify-center">
              {/* Background Glow Ring */}
              <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-tr from-limeAccent/10 via-transparent to-emeraldAccent/10 blur-xl pointer-events-none" />

              {/* Main Glass Console */}
              <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surfaceElevated/70 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-limeAccent/40">

                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-borderMuted/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-textMuted tracking-wider pl-1">
                      LIVE_CPM_ORACLE
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emeraldAccent border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emeraldAccent animate-pulse" />
                    SYNCED
                  </span>
                </div>

                {/* Short-Form Media Card Simulation */}
                <div className="mt-4 rounded-xl border border-borderMuted/50 bg-[#0B0F10]/70 p-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-limeAccent/15 text-limeAccent font-mono text-xs font-bold border border-limeAccent/30">
                        9:16
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-textMain text-xs">SaaS Launch Hook.mp4</p>
                        <p className="text-[10px] font-mono text-textMuted">TikTok • Reels • X Clip</p>
                      </div>
                    </div>
                    <span className="rounded bg-limeAccent/10 px-2 py-0.5 font-mono text-[10px] font-bold text-limeAccent">
                      $5.20 CPM
                    </span>
                  </div>

                  {/* Dynamic Audio / Impression Waves */}
                  <div className="flex items-end gap-1 h-8 px-2 py-1 bg-surface/50 rounded-lg border border-borderMuted/40">
                    {[40, 75, 55, 95, 60, 85, 45, 90, 70, 100, 65, 80, 50, 90, 40].map((h, i) => (
                      <span
                        key={i}
                        className="w-full rounded-full bg-gradient-to-t from-limeAccent/40 to-limeAccent transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          animation: `pulse 1.8s ease-in-out ${i * 0.1}s infinite alternate`
                        }}
                      />
                    ))}
                  </div>

                  {/* Progress / Escrow Release Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-textMuted">
                      <span>Verified Impressions</span>
                      <span className="text-textMain font-semibold">142,800 / 250,000</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div className="h-full w-[57%] rounded-full bg-gradient-to-r from-emeraldAccent to-limeAccent transition-all duration-1000 shadow-[0_0_12px_rgba(200,255,0,0.4)]" />
                    </div>
                  </div>
                </div>

                {/* Live Transaction Settlement Row */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface/60 border border-borderMuted/40 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emeraldAccent/15 text-emeraldAccent border border-emeraldAccent/20">
                      <span className="text-xs font-mono font-bold">$</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-textMain">Instant Escrow Release</p>
                      <p className="text-[9px] font-mono text-textMuted">Tx: 0x8f...39b2 • Automated</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emeraldAccent">
                    +$742.56
                  </span>
                </div>

                {/* Floating Verified Badge */}
                <div className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl border border-limeAccent/30 bg-[#0B0F10]/90 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-limeAccent animate-ping" />
                  <span className="text-[10px] font-mono font-semibold text-limeAccent">
                    Auto-Disbursing CPM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DISCOVER & FILTER BAR (Section 2A) */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Platform filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {platformOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPlatform(opt.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-heading font-bold transition ${selectedPlatform === opt.id
                    ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20'
                    : 'bg-surface text-textMuted hover:text-textMain border border-borderMuted hover:bg-surfaceElevated'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort, Search, and Add Campaign Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl bg-surface border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none w-full sm:w-auto"
              >
                <option value="highest_cpm">Sort: Highest CPM</option>
                <option value="budget_left">Sort: Most Budget Left</option>
                <option value="views">Sort: Most Views Tracked</option>
                <option value="newest">Sort: Newest</option>
              </select>

              <input
                type="text"
                placeholder="Search campaigns, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl bg-surface border border-borderMuted px-3 py-2 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none w-full sm:min-w-[180px]"
              />

              <button
                onClick={handleOpenCreateCampaign}
                className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-3.5 py-2 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-limeAccent/20 transition shrink-0 active:scale-[0.98] w-full sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Add Campaign</span>
              </button>
            </div>
          </div>

          {/* Niche Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-textMuted mr-2 flex items-center gap-1 font-heading">
              <Filter className="h-3 w-3" /> Niche:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${selectedCategory === cat
                  ? 'bg-surfaceElevated text-limeAccent font-heading font-bold border border-borderMuted'
                  : 'text-textMuted hover:text-textMain'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SEGMENTED ARCHETYPE SWITCHER (Section 2 - Work Style) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface border border-borderMuted shadow-lg">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-bold transition-all ${selectedType === 'all'
                ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20 scale-[1.02]'
                : 'text-textMuted hover:text-textMain hover:bg-surfaceElevated'
              }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Campaigns</span>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
              {campaigns.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('cpm_pool')}
            className={`cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-bold transition-all ${selectedType === 'cpm_pool'
                ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20 scale-[1.02]'
                : 'text-textMuted hover:text-textMain hover:bg-surfaceElevated'
              }`}
          >
            <Video className="h-3.5 w-3.5 text-limeAccent" />
            <span>Pay-Per-View (CPM)</span>
            <span className="text-[10px] font-mono opacity-70 hidden sm:inline">• Clip Syndication</span>
            <span className="rounded-full bg-limeAccent/15 px-2 py-0.5 text-[10px] font-mono text-limeAccent border border-limeAccent/30">
              {campaigns.filter((c) => (c.execution_type || 'cpm_pool') === 'cpm_pool').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('creator_direct')}
            className={`cursor-pointer flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-heading font-bold transition-all ${selectedType === 'creator_direct'
                ? 'bg-cyan-400 text-[#0B0F10] shadow-md shadow-cyan-400/20 scale-[1.02]'
                : 'text-textMuted hover:text-textMain hover:bg-surfaceElevated'
              }`}
          >
            <Trophy className="h-3.5 w-3.5 text-cyan-400" />
            <span>Direct Sponsorships</span>
            <span className="text-[10px] font-mono opacity-80 hidden sm:inline">• Custom Success</span>
            <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-400/30">
              {campaigns.filter((c) => c.execution_type === 'creator_direct' || c.execution_type === 'flat_bounty' || (c as any).execution_type === 'custom_bounty').length}
            </span>
          </button>
        </div>

        {/* CAMPAIGN CARDS GRID (Unified Archetype Architecture) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const joined = isJoined(camp.id);
            const budgetPercent = Math.max(
              0,
              Math.min(100, (camp.remaining_budget / camp.total_budget) * 100)
            );

            // Archetype-specific metadata helpers
            const typeConfigs: Record<string, {
              label: string;
              badgeClass: string;
              cta: string;
              metricTitle: string;
              metricHighlight: string;
              subMetaLeft: string;
              subMetaLeftVal: string;
              subMetaRight: string;
              subMetaRightVal: string;
              progressLabel: string;
            }> = {
              cpm_pool: {
                label: 'Pay-Per-View CPM',
                badgeClass: 'bg-limeAccent/10 text-limeAccent border-limeAccent/30',
                cta: 'Join & Clip',
                metricTitle: 'Performance CPM',
                metricHighlight: `$${camp.cpm_rate?.toFixed(2) || '1.00'} / 1K views`,
                subMetaLeft: 'Clip Cap',
                subMetaLeftVal: `$${camp.max_payout_per_clip || 500}`,
                subMetaRight: 'Unlock',
                subMetaRightVal: `${(camp.min_views_threshold || 1000).toLocaleString()} views`,
                progressLabel: 'Escrow Left',
              },
              flat_bounty: {
                label: 'Direct Sponsorship • Custom Success',
                badgeClass: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
                cta: 'Claim Deal',
                metricTitle: 'Custom Success Payout',
                metricHighlight: `$${camp.bounty_rate?.toFixed(2) || camp.flat_rate?.toFixed(2) || '500'} / Deal`,
                subMetaLeft: 'Criteria',
                subMetaLeftVal: camp.guidelines?.success_criteria ? 'Custom Criteria' : 'Brand Rules',
                subMetaRight: 'Deliverable',
                subMetaRightVal: camp.deliverable_type || 'Custom Success',
                progressLabel: 'Slots Remaining',
              },
              creator_direct: {
                label: 'Direct Sponsorship • Custom Success',
                badgeClass: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
                cta: 'Apply for Deal',
                metricTitle: 'Custom Success Payout',
                metricHighlight: `$${camp.flat_rate?.toLocaleString() || camp.bounty_rate?.toLocaleString() || '500'} / Deal`,
                subMetaLeft: 'Criteria',
                subMetaLeftVal: camp.guidelines?.success_criteria ? 'Custom Criteria' : (camp.min_followers ? `${(camp.min_followers / 1000).toFixed(0)}k+ Followers` : 'Custom Criteria'),
                subMetaRight: 'Deliverable',
                subMetaRightVal: camp.deliverable_type || 'Custom Success',
                progressLabel: 'Campaign Budget',
              },
            };

            const executionKey = camp.execution_type || 'cpm_pool';
            const currentType = typeConfigs[executionKey] || typeConfigs.cpm_pool;

            return (
              <div
                key={camp.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-borderMuted/80 bg-surface/90 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-limeAccent/40 hover:bg-surfaceElevated/70 hover:shadow-2xl hover:shadow-limeAccent/5"
              >
                {/* Subtle Ambient Top Border Highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity group-hover:via-limeAccent/40" />

                <div>
                  {/* Top Header: Brand info & Archetype Tag */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-canvas border border-borderMuted/80 shadow-inner flex items-center justify-center">
                        {camp.brand_logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-heading font-bold text-sm text-textMain tracking-tight">
                            {camp.brand_name}
                          </span>
                          {camp.brand_leaderboard_rank && (
                            <span className="rounded bg-limeAccent/15 px-1.5 py-0.5 text-[9px] font-mono font-bold text-limeAccent border border-limeAccent/30">
                              #{camp.brand_leaderboard_rank}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-textMuted font-mono">
                            {camp.category}
                          </span>
                          <span className="text-textMuted/40 text-[10px]">•</span>
                          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-semibold border ${currentType.badgeClass}`}>
                            {currentType.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Lifecycle Status */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${camp.status === 'active'
                          ? 'bg-emeraldAccent/15 text-emeraldAccent border-emeraldAccent/30'
                          : camp.status === 'paused'
                            ? 'bg-limeAccent/15 text-limeAccent border-limeAccent/30'
                            : 'bg-surfaceElevated text-textMuted border-borderMuted'
                        }`}
                    >
                      {camp.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-heading font-bold text-textMain mb-1.5 leading-snug line-clamp-1 group-hover:text-limeAccent transition-colors">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-textMuted line-clamp-2 mb-4 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* Platforms Accepted & Perks */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {(Array.isArray(camp.platforms) ? camp.platforms : []).map((p) => {
                      const platMeta = formatPlatform(p);
                      return (
                        <span
                          key={p}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold border ${platMeta.badgeBg}`}
                        >
                          {platMeta.label}
                        </span>
                      );
                    })}

                    {camp.guidelines?.hooks && camp.guidelines.hooks.length > 0 && (
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold bg-amber-950/30 text-amber-300 border border-amber-500/30">
                        ⚡ {camp.guidelines.hooks.length} Hooks
                      </span>
                    )}

                    {camp.asset_drive_link && (
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold bg-limeAccent/10 text-limeAccent border border-limeAccent/30">
                        📁 Assets Ready
                      </span>
                    )}
                  </div>

                  {/* Dynamic Rate & Mechanics Box */}
                  <div className="rounded-xl bg-surfaceElevated/60 border border-borderMuted/70 p-3 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-textMuted">
                        {currentType.metricTitle}
                      </span>
                      <span className="text-sm font-mono font-extrabold text-limeAccent">
                        {currentType.metricHighlight}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-textMuted pt-1.5 border-t border-borderMuted/50">
                      <span>{currentType.subMetaLeft}:</span>
                      <strong className="text-textMain font-mono font-medium">
                        {currentType.subMetaLeftVal}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-textMuted">
                      <span>{currentType.subMetaRight}:</span>
                      <strong className="text-textMain font-mono font-medium">
                        {currentType.subMetaRightVal}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer: Budget / Quota Progress & Conversion */}
                <div className="space-y-3 pt-3 border-t border-borderMuted/70">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-textMain text-[11px]">
                      ${camp.remaining_budget.toLocaleString()} / ${camp.total_budget.toLocaleString()} left
                    </span>
                    <span className="text-emeraldAccent text-[10px] font-semibold">
                      {budgetPercent.toFixed(0)}% {currentType.progressLabel}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-surfaceElevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${budgetPercent > 20 ? 'bg-emeraldAccent' : 'bg-limeAccent'
                        }`}
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="flex-1 rounded-xl bg-surfaceElevated hover:bg-surface border border-borderMuted text-textMain font-heading font-semibold py-2.5 text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
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
                        className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-4 py-2.5 text-xs flex items-center gap-1.5 transition active:scale-[0.98] shadow-sm shadow-limeAccent/20 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-[#0B0F10]" />
                        <span>{currentType.cta}</span>
                      </button>
                    ) : (
                      <span className="rounded-xl bg-emeraldAccent/15 text-emeraldAccent border border-emeraldAccent/30 px-3 py-2 text-xs font-heading font-bold flex items-center gap-1">
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
      {/* FOOTER */}
      <footer className="border-t border-borderMuted bg-canvas py-8 px-4 text-center text-xs text-textMuted mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <p className="text-[11px] text-textMuted">Short-Form Creator Campaign Rewards</p>
          </div>
          <div className="flex items-center gap-4 text-textMuted">
            <Link href="/" className="hover:text-limeAccent transition">Leaderboard</Link>
            <Link href="/campaigns" className="hover:text-emeraldAccent transition">Campaigns</Link>
            <Link href="/terms" className="hover:text-limeAccent transition">Terms</Link>
            <Link href="/privacy" className="hover:text-limeAccent transition">Privacy</Link>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
