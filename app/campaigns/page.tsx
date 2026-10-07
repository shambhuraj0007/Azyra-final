'use client';

import { useState, useMemo } from 'react';
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
import CampaignNavbar from '../../components/CampaignNavbar';
import CreateCampaignModal from '../../components/CreateCampaignModal';
import WithdrawModal from '../../components/WithdrawModal';
import { useCampaigns } from '../../lib/CampaignContext';
import { SocialPlatform, Campaign } from '../../lib/types';
import { formatPlatform } from '../../lib/campaignUtils';
import AzyraLogo from '../../components/AzyraLogo';

export default function CampaignsMarketplacePage() {
  const { 
    currentUser, 
    campaigns, 
    submissions, 
    participants, 
    isJoined, 
    joinCampaign,
    toggleCampaignStatus 
  } = useCampaigns();

  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'highest_cpm' | 'budget_left' | 'views' | 'newest'>('highest_cpm');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Platform filters
  const platformOptions: { id: string; label: string }[] = [
    { id: 'All', label: 'All Platforms' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'instagram', label: 'Instagram Reels' },
    { id: 'youtube_shorts', label: 'YouTube Shorts' },
  ];

  const categories = ['All', 'DevTools', 'AI & ML', 'Design', 'SaaS', 'Crypto'];

  // Total platform stats calculation
  const totalEscrowPool = campaigns.reduce((acc, c) => acc + c.remaining_budget, 0);
  const totalViewsTracked = campaigns.reduce((acc, c) => acc + c.total_views_tracked, 0);
  const totalPaidOut = campaigns.reduce((acc, c) => acc + c.total_paid_out, 0);
  const totalClippers = 142; // simulated network count

  // Filter and sort
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((camp) => {
        const matchesPlatform =
          selectedPlatform === 'All' ||
          camp.platforms.includes(selectedPlatform as SocialPlatform);
        const matchesCategory =
          selectedCategory === 'All' || camp.category === selectedCategory;
        const matchesSearch =
          camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesPlatform && matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_cpm') return b.cpm_rate - a.cpm_rate;
        if (sortBy === 'budget_left') return b.remaining_budget - a.remaining_budget;
        if (sortBy === 'views') return b.total_views_tracked - a.total_views_tracked;
        return b.created_at - a.created_at;
      });
  }, [campaigns, selectedPlatform, selectedCategory, searchQuery, sortBy]);

  // Creator's joined campaigns
  const myJoinedCampaigns = useMemo(() => {
    return campaigns.filter((c) => isJoined(c.id));
  }, [campaigns, participants, currentUser.id]);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col bg-mesh-dark">
      {/* Top Navigation */}
      <CampaignNavbar
        onOpenCreateCampaign={() => setIsCreateModalOpen(true)}
        onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* HERO SECTION & TWO-SIDED BANNER */}
        <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-zinc-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5" />
                Whop Content Rewards Protocol
              </span>
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
                Current Role:{' '}
                <strong className={currentUser.role === 'creator' ? 'text-emerald-400' : 'text-amber-400'}>
                  {currentUser.role === 'creator' ? '🎬 Creator / Clipper' : '⚡ Brand Sponsor'}
                </strong>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Get Paid Per View to Clip{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
                Top Internet Products
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed">
              Brands fund escrow pools with pay-per-view CPM rates. Creators download raw footage,
              post short-form clips to TikTok, Reels, and Shorts, and receive automated payouts as view counts grow.
            </p>

            {/* Platform Stats Row (Section 2A) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800/80">
              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-3.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Active Escrow Pools
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-0.5">
                  ${totalEscrowPool.toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-3.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Shorts Views Tracked
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
                  {(totalViewsTracked / 1000000).toFixed(1)}M+
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-3.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Total Paid to Clippers
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-400 mt-0.5">
                  ${totalPaidOut.toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-3.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Active Clippers
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-sky-400 mt-0.5">
                  {totalClippers}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BRAND MANAGEMENT STRIP (If Brand persona is active) */}
        {currentUser.role === 'brand' && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 font-black">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Brand Portal: {currentUser.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Escrow Funds Available: <strong className="text-amber-400 font-mono">${currentUser.wallet_balance.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-4 py-2 text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-400/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Launch New Campaign</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATOR WORKSPACE QUICK GLANCE (If Creator persona is active) */}
        {currentUser.role === 'creator' && myJoinedCampaigns.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <h3 className="text-sm font-bold text-white">
                  Your Joined Campaign Workspaces ({myJoinedCampaigns.length})
                </h3>
              </div>
              <span className="text-xs text-zinc-400">
                Total Submissions: <strong className="text-white">{submissions.length}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {myJoinedCampaigns.map((camp) => (
                <Link
                  key={camp.id}
                  href={`/campaigns/${camp.id}`}
                  className="group rounded-xl bg-zinc-900/90 border border-zinc-800 p-3.5 flex items-center justify-between hover:border-emerald-500/50 hover:bg-zinc-800/80 transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate block">
                      {camp.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ${camp.cpm_rate.toFixed(2)} CPM • Cap: ${camp.max_payout_per_clip}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 shrink-0 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* DISCOVER & FILTER BAR (Section 2A) */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Platform filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {platformOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedPlatform(opt.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedPlatform === opt.id
                      ? 'bg-emerald-400 text-zinc-950 font-bold shadow-md shadow-emerald-400/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort & Search */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-400 outline-none"
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
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-400 outline-none min-w-[200px]"
              />
            </div>
          </div>

          {/* Niche Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-zinc-500 mr-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Niche:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${
                  selectedCategory === cat
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* CAMPAIGN CARDS GRID (Section 2A) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const joined = isJoined(camp.id);
            const budgetPercent = Math.max(
              0,
              Math.min(100, (camp.remaining_budget / camp.total_budget) * 100)
            );

            return (
              <div
                key={camp.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 flex flex-col justify-between shadow-xl transition-all hover:border-zinc-700 hover:bg-zinc-900/90 hover:-translate-y-1"
              >
                <div>
                  {/* Top Header: Brand info & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                        {camp.brand_logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">
                            {camp.brand_name}
                          </span>
                          {camp.brand_leaderboard_rank && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                              Azyra Rank #{camp.brand_leaderboard_rank}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {camp.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        camp.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : camp.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {camp.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-black text-white mb-2 leading-snug line-clamp-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* Platforms accepted */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {camp.platforms.map((p) => {
                      const platMeta = formatPlatform(p);
                      return (
                        <span
                          key={p}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${platMeta.badgeBg}`}
                        >
                          {platMeta.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* CPM Rate & Caps Card (Whop Model) */}
                  <div className="rounded-xl bg-zinc-950/90 border border-zinc-800 p-3 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        Pay Rate (CPM)
                      </span>
                      <span className="text-sm font-mono font-black text-emerald-400">
                        ${camp.cpm_rate.toFixed(2)} / 1K views
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                      <span>Max Cap / Clip:</span>
                      <strong className="text-zinc-200">${camp.max_payout_per_clip}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Min View Unlock:</span>
                      <strong className="text-zinc-200">{camp.min_views_threshold.toLocaleString()} views</strong>
                    </div>
                  </div>
                </div>

                {/* Footer: Budget Progress & Actions */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300">
                      ${camp.remaining_budget.toLocaleString()} / ${camp.total_budget.toLocaleString()} left
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px]">
                      {budgetPercent.toFixed(0)}% Escrow
                    </span>
                  </div>

                  {/* Escrow remaining progress bar */}
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetPercent > 20 ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${budgetPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-zinc-400" />
                      <span>View Brief & Clips</span>
                    </Link>

                    {!joined ? (
                      <button
                        onClick={() => joinCampaign(camp.id)}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-4 py-2.5 text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-zinc-950" />
                        <span>Join</span>
                      </button>
                    ) : (
                      <span className="rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 text-xs font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        Joined
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
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <p className="text-[11px] text-zinc-500">Short-Form Creator Campaign Rewards</p>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/" className="hover:text-amber-400">Leaderboard</Link>
            <Link href="/campaigns" className="hover:text-emerald-400">Campaigns</Link>
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
