'use client';

import { useState, useMemo, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Megaphone, 
  Sparkles, 
  Trophy, 
  FolderDown, 
  CheckCircle2, 
  ExternalLink, 
  ArrowLeft, 
  Clock, 
  Send, 
  Video, 
  AlertCircle, 
  Copy, 
  Check, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  ShieldCheck, 
  PauseCircle, 
  PlayCircle, 
  Archive,
  BarChart3,
  Flame,
  Zap
} from 'lucide-react';
import CampaignNavbar from '../../../components/CampaignNavbar';
import WithdrawModal from '../../../components/WithdrawModal';
import CreateCampaignModal from '../../../components/CreateCampaignModal';
import { useCampaigns } from '../../../lib/CampaignContext';
import AzyraLogo from '../../../components/AzyraLogo';
import { parseSocialUrl, formatPlatform } from '../../../lib/campaignUtils';
import { SocialPlatform } from '../../../lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function CampaignWorkspaceContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;
  const router = useRouter();

  const { 
    currentUser, 
    campaigns, 
    submissions, 
    isJoined, 
    joinCampaign, 
    submitClip, 
    simulateViewGrowth,
    toggleCampaignStatus 
  } = useCampaigns();

  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [initialViews, setInitialViews] = useState<number>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const campaign = campaigns.find((c) => c.id === campaignId);

  // Filter submissions by this creator for this campaign
  const myCampaignSubmissions = useMemo(() => {
    return submissions.filter(
      (s) => s.campaign_id === campaignId && s.creator_id === currentUser.id
    );
  }, [submissions, campaignId, currentUser.id]);

  // Total views and earnings from this campaign by creator
  const totalEarnedInCampaign = myCampaignSubmissions.reduce(
    (acc, s) => acc + s.earned_amount,
    0
  );
  const totalViewsInCampaign = myCampaignSubmissions.reduce(
    (acc, s) => acc + s.current_view_count,
    0
  );

  // Live URL validation preview
  const parsedPreview = useMemo(() => {
    if (!videoUrl) return null;
    return parseSocialUrl(videoUrl);
  }, [videoUrl]);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white flex flex-col items-center justify-center p-4">
        <p className="text-zinc-400 mb-4">Campaign not found or archived.</p>
        <Link
          href="/campaigns"
          className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700"
        >
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const joined = isJoined(campaign.id);
  const isBrandOwner = currentUser.role === 'brand' && campaign.brand_id === currentUser.id;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleClipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const res = submitClip({
      campaignId: campaign.id,
      videoUrl,
      initialViews: Number(initialViews) || 0,
    });

    if (!res.success) {
      setSubmitError(res.error || 'Submission failed');
      return;
    }

    setSubmitSuccess(true);
    setVideoUrl('');
    setInitialViews(0);
    setTimeout(() => setSubmitSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col bg-mesh-dark">
      <CampaignNavbar
        onOpenCreateCampaign={() => setIsCreateOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Back navigation & Status bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Campaign Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider border ${
                campaign.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              Status: {campaign.status.replace('_', ' ')}
            </span>

            {/* Brand Management Quick Actions (Section 2B) */}
            {isBrandOwner && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() =>
                    toggleCampaignStatus(
                      campaign.id,
                      campaign.status === 'active' ? 'paused' : 'active'
                    )
                  }
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1 text-xs font-bold flex items-center gap-1 border border-zinc-700"
                >
                  {campaign.status === 'active' ? (
                    <>
                      <PauseCircle className="h-3.5 w-3.5 text-amber-400" /> Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-400" /> Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Archive campaign and refund unspent escrow?')) {
                      toggleCampaignStatus(campaign.id, 'archived');
                    }
                  }}
                  className="rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 px-3 py-1 text-xs font-bold flex items-center gap-1 border border-red-500/30"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE HERO / BRIEF HEADER */}
        <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-zinc-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner">
                  {campaign.brand_logo}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-300">
                      {campaign.brand_name}
                    </h2>
                    {campaign.brand_leaderboard_rank && (
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                        Azyra Rank #{campaign.brand_leaderboard_rank}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                    {campaign.title}
                  </h1>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {campaign.description}
              </p>

              {/* Download Assets CTA (Section 2C) */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={campaign.asset_drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black px-4 py-2.5 text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  <FolderDown className="h-4 w-4" />
                  <span>Download Raw Video Footage & Hooks</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>

                <button
                  onClick={() => copyToClipboard(campaign.asset_drive_link)}
                  className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedTag === campaign.asset_drive_link ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copy Drive Link</span>
                </button>
              </div>
            </div>

            {/* Reward & CPM Structure Box */}
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 min-w-[280px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-500">
                  Pay-Per-View Rate
                </span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  ${campaign.cpm_rate.toFixed(2)} / 1K views
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-900">
                <div className="flex justify-between">
                  <span>Clip Reward Cap:</span>
                  <strong className="text-white">${campaign.max_payout_per_clip} max</strong>
                </div>
                <div className="flex justify-between">
                  <span>Min Views Required:</span>
                  <strong className="text-white">
                    {campaign.min_views_threshold.toLocaleString()} views
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Escrow:</span>
                  <strong className="text-emerald-400 font-mono">
                    ${campaign.remaining_budget.toLocaleString()} / ${campaign.total_budget.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Join action */}
              <div className="pt-2">
                {!joined ? (
                  <button
                    onClick={() => joinCampaign(campaign.id)}
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 fill-zinc-950" />
                    <span>Join Campaign as Clipper</span>
                  </button>
                ) : (
                  <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>You're Enrolled in this Campaign</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GUIDELINES & CONTENT CRITERIA (Section 2C) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Allowed Hashtags */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Required Hashtags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {campaign.guidelines.allowed_hashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => copyToClipboard(tag)}
                  className="rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-400 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 transition"
                  title="Click to copy"
                >
                  <span>{tag}</span>
                  {copiedTag === tag ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts to Mention */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 block">
              Tag / Accounts to Mention
            </span>
            <div className="flex flex-wrap gap-1.5">
              {campaign.guidelines.accounts_to_mention.map((acc) => (
                <button
                  key={acc}
                  onClick={() => copyToClipboard(acc)}
                  className="rounded-lg bg-zinc-950 border border-zinc-800 hover:border-sky-400 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 transition"
                  title="Click to copy"
                >
                  <span>{acc}</span>
                  {copiedTag === acc ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3 text-zinc-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Forbidden Audio & Notes */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
              Do's & Don'ts
            </span>
            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
              <li>{campaign.guidelines.notes}</li>
              {campaign.guidelines.forbidden_audio.map((f, i) => (
                <li key={i} className="text-rose-300/90">
                  Forbidden: {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SUBMIT CLIP DRAWER / FORM (Section 2C) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-black">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Submit Published Clip Link
              </h3>
              <p className="text-xs text-zinc-400">
                Paste your live TikTok, Instagram Reel, or YouTube Shorts link for automated view tracking & payouts
              </p>
            </div>
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Clip successfully submitted! Tracking automation has been initialized.
              </span>
            </div>
          )}

          <form onSubmit={handleClipSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Published Video URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.tiktok.com/@handle/video/12345678 or https://instagram.com/reel/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-400 outline-none font-mono"
                />

                {/* Real-time regex parsed feedback */}
                {parsedPreview && (
                  <div className="pt-1 flex items-center gap-2 text-[11px]">
                    {parsedPreview.isValid && parsedPreview.platform ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Valid {formatPlatform(parsedPreview.platform).label} clip detected (ID: {parsedPreview.externalId})
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold">
                        {parsedPreview.error}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Initial View Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialViews}
                  onChange={(e) => setInitialViews(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-400 outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Current views on link when submitted
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!joined}
              className="rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black px-6 py-3 text-xs flex items-center gap-2 transition active:scale-95 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {joined ? 'Submit Clip for Verification & Tracking' : 'Join Campaign First to Submit'}
              </span>
            </button>
          </form>
        </div>

        {/* PERSONAL EARNINGS & CLIPS DASHBOARD (Section 2C & Section 3) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white">
                  Your Submitted Clips & Live View Tracking
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Automated background worker polls views and calculates CPM payouts
              </p>
            </div>

            {/* Creator Metrics Pills */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  Views on this Campaign
                </span>
                <div className="text-sm font-mono font-bold text-white">
                  {totalViewsInCampaign.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  Accrued Earnings
                </span>
                <div className="text-sm font-mono font-black text-emerald-400">
                  ${totalEarnedInCampaign.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {myCampaignSubmissions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              <Video className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">
                You haven't submitted any clips for this campaign yet.
              </p>
              <p className="text-[11px] text-zinc-600 mt-1">
                Download the raw footage above, edit a 30s short, publish it, and submit the link!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {myCampaignSubmissions.map((sub) => {
                const platMeta = formatPlatform(sub.platform);
                const netViews = Math.max(0, sub.current_view_count - sub.initial_view_count);

                return (
                  <div
                    key={sub.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${platMeta.badgeBg}`}
                        >
                          {platMeta.label}
                        </span>
                        <span className="text-xs font-mono text-zinc-400 truncate max-w-xs">
                          {sub.video_url}
                        </span>
                        <a
                          href={sub.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-white"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                        <span>
                          Current Views:{' '}
                          <strong className="text-white font-mono">
                            {sub.current_view_count.toLocaleString()}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Initial: {sub.initial_view_count.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          Net Eligible: <strong className="text-emerald-400 font-mono">+{netViews.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Accrued payout */}
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-zinc-500">
                          Accrued Payout
                        </div>
                        <div className="text-base font-mono font-black text-emerald-400">
                          ${sub.earned_amount.toFixed(2)}
                        </div>
                      </div>

                      {/* Simulation Button for Testing the Automated Loop! */}
                      <button
                        onClick={() => simulateViewGrowth(sub.id, 15000)}
                        title="Simulate traffic spike / worker poll (+15,000 views)"
                        className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 hover:border-emerald-500/50"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span>Simulate +15k Views</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />

      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

export default function CampaignWorkspacePage(props: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090d] text-zinc-400 flex items-center justify-center text-sm">Loading campaign workspace...</div>}>
      <CampaignWorkspaceContent {...props} />
    </Suspense>
  );
}
