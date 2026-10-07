'use client';

import { useState, useMemo } from 'react';
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

  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'highest_cpm' | 'budget_left' | 'views' | 'newest'>('highest_cpm');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* Universal Top Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
        {/* HERO SECTION & TWO-SIDED BANNER */}
        <div className="relative rounded-2xl border border-borderMuted bg-surface p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-limeAccent/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-emeraldAccent/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">

              {/* Persona Switcher embedded neatly into Hero */}



            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight text-textMain leading-tight">
              Get Paid For Views To Market{' '}
              <span className="text-limeAccent">
                Top Internet Products and Earn
              </span>
            </h1>

            <p className="text-sm sm:text-base text-textMuted max-w-2xl leading-relaxed">
              Brands fund escrow pools with pay-per-view CPM rates. Creators download raw footage,
              post short-form clips to X, Reels, and Shorts, and receive automated payouts as view counts grow.
            </p>

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

            {/* Sort & Search */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl bg-surface border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
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
                className="rounded-xl bg-surface border border-borderMuted px-3 py-2 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none min-w-[200px]"
              />
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
                className="rounded-xl border border-borderMuted bg-surface p-6 flex flex-col justify-between shadow-xl transition-all hover:border-limeAccent/40 hover:bg-surfaceElevated/60 hover:-translate-y-0.5"
              >
                <div>
                  {/* Top Header: Brand info & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-canvas border border-borderMuted">
                        {camp.brand_logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-bold text-sm text-textMain">
                            {camp.brand_name}
                          </span>
                          {camp.brand_leaderboard_rank && (
                            <span className="rounded bg-limeAccent/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/30">
                              Azyra Rank #{camp.brand_leaderboard_rank}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-textMuted font-mono">
                          {camp.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${camp.status === 'active'
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
                  <h3 className="text-base font-heading font-bold text-textMain mb-2 leading-snug line-clamp-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-textMuted line-clamp-2 mb-4 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* Platforms accepted */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {camp.platforms.map((p) => {
                      const platMeta = formatPlatform(p);
                      return (
                        <span
                          key={p}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border ${platMeta.badgeBg}`}
                        >
                          {platMeta.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* CPM Rate & Caps Card (Whop Model) */}
                  <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-heading font-bold text-textMuted">
                        Pay Rate (CPM)
                      </span>
                      <span className="text-sm font-mono font-bold text-limeAccent">
                        ${camp.cpm_rate.toFixed(2)} / 1K views
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-textMuted pt-1 border-t border-borderMuted">
                      <span>Max Cap / Clip:</span>
                      <strong className="text-textMain font-mono">${camp.max_payout_per_clip}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-textMuted">
                      <span>Min View Unlock:</span>
                      <strong className="text-textMain font-mono">{camp.min_views_threshold.toLocaleString()} views</strong>
                    </div>
                  </div>
                </div>

                {/* Footer: Budget Progress & Actions */}
                <div className="space-y-3 pt-2 border-t border-borderMuted">
                  <div className="flex items-center justify-between text-xs text-textMuted">
                    <span className="font-semibold text-textMain font-mono">
                      ${camp.remaining_budget.toLocaleString()} / ${camp.total_budget.toLocaleString()} left
                    </span>
                    <span className="text-emeraldAccent font-mono text-[11px]">
                      {budgetPercent.toFixed(0)}% Escrow
                    </span>
                  </div>

                  {/* Escrow remaining progress bar */}
                  <div className="h-1.5 w-full bg-surfaceElevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${budgetPercent > 20 ? 'bg-emeraldAccent' : 'bg-limeAccent'
                        }`}
                      style={{ width: `${budgetPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="flex-1 rounded-xl bg-transparent hover:bg-surfaceElevated text-textMain font-heading font-bold py-2.5 text-xs flex items-center justify-center gap-1.5 border border-borderMuted transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-textMuted" />
                      <span>View Brief & Clips</span>
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
                        className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-4 py-2.5 text-xs flex items-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-limeAccent/20"
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-[#0B0F10]" />
                        <span>Join</span>
                      </button>
                    ) : (
                      <span className="rounded-xl bg-emeraldAccent/15 text-emeraldAccent border border-emeraldAccent/30 px-3 py-2 text-xs font-heading font-bold flex items-center gap-1">
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
      <footer className="border-t border-borderMuted bg-canvas py-8 px-4 text-center text-xs text-textMuted mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AzyraLogo size="sm" />
            <p className="text-[11px] text-textMuted">Short-Form Creator Campaign Rewards</p>
          </div>
          <div className="flex items-center gap-4 text-textMuted">
            <Link href="/" className="hover:text-limeAccent transition">Leaderboard</Link>
            <Link href="/campaigns" className="hover:text-emeraldAccent transition">Campaigns</Link>
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
