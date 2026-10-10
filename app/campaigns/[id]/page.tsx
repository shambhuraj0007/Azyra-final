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
  Zap,
  Target,
  Palette,
  Film,
  Lightbulb
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
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
    openSetupModal,
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
      <div className="min-h-screen bg-canvas text-textMain flex flex-col items-center justify-center p-4">
        <p className="text-textMuted mb-4">Campaign not found or archived.</p>
        <Link
          href="/campaigns"
          className="rounded-xl bg-surfaceElevated border border-borderMuted px-4 py-2 text-xs font-heading font-bold text-textMain hover:bg-surface"
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

  const handleClipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const res = await submitClip({
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
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      {/* Universal Top Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Back navigation & Status bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-xs font-semibold text-textMuted hover:text-textMain transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Campaign Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider border ${campaign.status === 'active'
                  ? 'bg-emeraldAccent/15 text-emeraldAccent border-emeraldAccent/30'
                  : 'bg-limeAccent/15 text-limeAccent border-limeAccent/30'
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
                  className="rounded-lg bg-surfaceElevated hover:bg-surface text-textMain px-3 py-1 text-xs font-heading font-bold flex items-center gap-1 border border-borderMuted transition"
                >
                  {campaign.status === 'active' ? (
                    <>
                      <PauseCircle className="h-3.5 w-3.5 text-limeAccent" /> Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-3.5 w-3.5 text-emeraldAccent" /> Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Archive campaign and refund unspent escrow?')) {
                      toggleCampaignStatus(campaign.id, 'archived');
                    }
                  }}
                  className="rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 px-3 py-1 text-xs font-heading font-bold flex items-center gap-1 border border-red-500/30 transition"
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE HERO / BRIEF HEADER */}
        <div className="relative rounded-2xl border border-borderMuted bg-surface p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-canvas border border-borderMuted shadow-inner">
                  {campaign.brand_logo}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-heading font-bold text-textMuted">
                      {campaign.brand_name}
                    </h2>
                    {campaign.brand_leaderboard_rank && (
                      <span className="rounded bg-limeAccent/15 px-2 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/30">
                        Azyra Rank #{campaign.brand_leaderboard_rank}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-textMain tracking-tight mt-0.5">
                    {campaign.title}
                  </h1>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-textMuted leading-relaxed">
                {campaign.description}
              </p>

              {/* Download Assets CTA (Section 2C) */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={campaign.asset_drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-4 py-2.5 text-xs flex items-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
                >
                  <FolderDown className="h-4 w-4" />
                  <span>Download Raw Video Footage & B-Roll</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>

                {campaign.guidelines.media_kit_link && (
                  <a
                    href={campaign.guidelines.media_kit_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-surfaceElevated hover:bg-surface text-textMain border border-borderMuted px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Palette className="h-4 w-4 text-emeraldAccent" />
                    <span>Brand Media Kit & Logos</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                )}

                <button
                  onClick={() => copyToClipboard(campaign.asset_drive_link)}
                  className="rounded-xl bg-surfaceElevated hover:bg-surface text-textMain border border-borderMuted px-3 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedTag === campaign.asset_drive_link ? (
                    <Check className="h-3.5 w-3.5 text-emeraldAccent" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>Copy Drive Link</span>
                </button>
              </div>
            </div>

            {/* Reward & CPM Structure Box */}
            <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-5 min-w-[280px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-heading font-bold uppercase text-textMuted">
                  Pay-Per-View Rate
                </span>
                <span className="text-xl font-mono font-bold text-limeAccent">
                  ${campaign.cpm_rate.toFixed(2)} / 1K views
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-textMuted pt-2 border-t border-borderMuted">
                <div className="flex justify-between">
                  <span>Clip Reward Cap:</span>
                  <strong className="text-textMain font-mono">${campaign.max_payout_per_clip} max</strong>
                </div>
                <div className="flex justify-between">
                  <span>Min Views Required:</span>
                  <strong className="text-textMain font-mono">
                    {campaign.min_views_threshold.toLocaleString()} views
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Escrow:</span>
                  <strong className="text-emeraldAccent font-mono">
                    ${campaign.remaining_budget.toLocaleString()} / ${campaign.total_budget.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Join action */}
              <div className="pt-2">
                {!joined ? (
                  <button
                    onClick={() => {
                      if (!currentUser?.isLoggedIn) {
                        router.push(`/login?redirect=/campaigns/${campaign.id}&join=${campaign.id}`);
                        return;
                      }
                      const res = joinCampaign(campaign.id);
                      if (!res.success) {
                        openSetupModal(campaign.id);
                      }
                    }}
                    className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4 fill-[#0B0F10]" />
                    <span>Join Campaign as Clipper</span>
                  </button>
                ) : (
                  <div className="rounded-xl bg-surface border border-emeraldAccent/30 p-2.5 text-center text-xs text-emeraldAccent font-heading font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emeraldAccent" />
                    <span>You're Enrolled in this Campaign</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CREATOR IMPLEMENTATION SUITE (All Details for Best Clip Creation)          */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-borderMuted pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-limeAccent/15 text-limeAccent rounded-xl border border-limeAccent/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-textMain">
                  Creator Implementation Suite
                </h3>
                <p className="text-xs text-textMuted">
                  Viral hook blueprints, core talking points, and compliance guardrails for maximum payouts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {campaign.guidelines.video_duration && (
                <span className="rounded-full px-3 py-1 text-xs font-mono font-bold bg-surfaceElevated border border-borderMuted text-limeAccent">
                  ⏱ {campaign.guidelines.video_duration}
                </span>
              )}
              {campaign.guidelines.target_audience && (
                <span className="rounded-full px-3 py-1 text-xs font-mono font-bold bg-surfaceElevated border border-borderMuted text-textMuted">
                  🎯 {campaign.guidelines.target_audience}
                </span>
              )}
            </div>
          </div>

          {/* 1. VIRAL OPENING HOOKS (FIRST 3 SECONDS) */}
          {campaign.guidelines.hooks && campaign.guidelines.hooks.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-surface p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <h4 className="text-sm font-heading font-bold text-amber-300 uppercase tracking-wider">
                    Recommended Viral Opening Hooks (First 3 Seconds)
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80 hidden sm:inline">
                  Click to copy hook line
                </span>
              </div>
              <p className="text-xs text-textMuted">
                Say or display one of these exact hook lines in the first 2-3 seconds to maximize organic short-form retention:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campaign.guidelines.hooks.map((hook, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(hook)}
                    className="group relative cursor-pointer rounded-xl bg-surfaceElevated border border-borderMuted hover:border-amber-400 p-4 transition flex items-start justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase">
                        Hook Angle #{idx + 1}
                      </span>
                      <p className="text-xs text-textMain font-mono font-semibold leading-relaxed group-hover:text-amber-300 transition">
                        {hook}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface text-textMuted group-hover:text-amber-400 group-hover:bg-amber-950/40 border border-borderMuted transition shrink-0 mt-0.5">
                      {copiedTag === hook ? (
                        <Check className="h-4 w-4 text-emeraldAccent" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. TALKING POINTS & CALL TO ACTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Talking Points */}
            <div className="rounded-2xl border border-borderMuted bg-surface p-6 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-limeAccent font-heading font-bold text-sm">
                <Target className="h-4 w-4" />
                <span>Core Value Props & Demo Checklist</span>
              </div>
              <p className="text-xs text-textMuted leading-relaxed">
                Ensure your video demonstrates at least 2 of these product capabilities:
              </p>
              <ul className="space-y-2 pt-1">
                {(campaign.guidelines.key_talking_points && campaign.guidelines.key_talking_points.length > 0
                  ? campaign.guidelines.key_talking_points
                  : campaign.guidelines.requirements
                ).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-textMain leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-limeAccent shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Call To Action & Example Inspo Clips */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Mandatory Call To Action */}
              {campaign.guidelines.call_to_action && (
                <div className="rounded-2xl border border-emeraldAccent/40 bg-surfaceElevated p-5 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-emeraldAccent flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Video Call-to-Action (CTA)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(campaign.guidelines.call_to_action!)}
                      className="text-[11px] font-mono text-emeraldAccent hover:underline flex items-center gap-1"
                    >
                      {copiedTag === campaign.guidelines.call_to_action ? 'Copied!' : 'Copy CTA'}
                    </button>
                  </div>
                  <p className="text-sm font-heading font-bold text-textMain italic bg-canvas/70 p-3 rounded-xl border border-borderMuted">
                    {campaign.guidelines.call_to_action}
                  </p>
                  <span className="text-[11px] text-textMuted block">
                    Deliver this CTA verbally or with bold text overlay in the final 5 seconds.
                  </span>
                </div>
              )}

              {/* Example Videos (Inspo) */}
              {campaign.guidelines.example_videos && campaign.guidelines.example_videos.length > 0 && (
                <div className="rounded-2xl border border-borderMuted bg-surface p-5 space-y-2 shadow-xl">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Film className="h-4 w-4" />
                    <span>Winning Clip References (Inspirations)</span>
                  </span>
                  <div className="space-y-1.5 pt-1">
                    {campaign.guidelines.example_videos.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-surfaceElevated hover:bg-surface border border-borderMuted text-xs font-mono text-textMain hover:text-cyan-300 transition"
                      >
                        <span className="truncate max-w-[280px]">{url}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. DO'S AND DON'TS GUARDRAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO's */}
            <div className="rounded-2xl border border-emeraldAccent/30 bg-surface p-6 space-y-3 shadow-xl">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-emeraldAccent flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Creative Do's (High Payout Guaranteed)</span>
              </span>
              <ul className="space-y-2 text-xs text-textMain leading-relaxed">
                {(campaign.guidelines.dos && campaign.guidelines.dos.length > 0
                  ? campaign.guidelines.dos
                  : [
                      'Hook viewers immediately within the first 3 seconds',
                      'Use bold high-contrast animated subtitles',
                      'Show clean 1080p+ vertical screen recordings',
                      'Maintain high energy and rapid jump cuts',
                    ]
                ).map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emeraldAccent font-bold">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DON'Ts */}
            <div className="rounded-2xl border border-red-500/30 bg-surface p-6 space-y-3 shadow-xl">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Creative Don'ts (Disqualification Risks)</span>
              </span>
              <ul className="space-y-2 text-xs text-textMain leading-relaxed">
                {(campaign.guidelines.donts && campaign.guidelines.donts.length > 0
                  ? campaign.guidelines.donts
                  : [
                      'No static slideshows or AI image text galleries',
                      'No copyrighted commercial audio tracks',
                      'Do not disparage or insult direct competitors',
                      'Never purchase fake bot views or engagement traffic',
                    ]
                ).map((dont, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-rose-200/90">
                    <span className="text-rose-400 font-bold">✗</span>
                    <span>{dont}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. TAGS, MENTIONS, AND AUDIO SPECIFICATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Allowed Hashtags */}
            <div className="rounded-2xl border border-borderMuted bg-surface p-5 space-y-3 shadow-xl">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-limeAccent block">
                Required Hashtags (Click to copy)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaign.guidelines.allowed_hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => copyToClipboard(tag)}
                    className="rounded-lg bg-surfaceElevated border border-borderMuted hover:border-limeAccent px-2.5 py-1 text-xs font-mono text-textMuted hover:text-textMain flex items-center gap-1 transition"
                    title="Click to copy"
                  >
                    <span>{tag}</span>
                    {copiedTag === tag ? (
                      <Check className="h-3 w-3 text-emeraldAccent" />
                    ) : (
                      <Copy className="h-3 w-3 text-textMuted" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts to Mention */}
            <div className="rounded-2xl border border-borderMuted bg-surface p-5 space-y-3 shadow-xl">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-emeraldAccent block">
                Tag Accounts in Caption
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaign.guidelines.accounts_to_mention.map((acc) => (
                  <button
                    key={acc}
                    onClick={() => copyToClipboard(acc)}
                    className="rounded-lg bg-surfaceElevated border border-borderMuted hover:border-emeraldAccent px-2.5 py-1 text-xs font-mono text-textMuted hover:text-textMain flex items-center gap-1 transition"
                    title="Click to copy"
                  >
                    <span>{acc}</span>
                    {copiedTag === acc ? (
                      <Check className="h-3 w-3 text-emeraldAccent" />
                    ) : (
                      <Copy className="h-3 w-3 text-textMuted" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio & Music Restrictions */}
            <div className="rounded-2xl border border-borderMuted bg-surface p-5 space-y-2 shadow-xl">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-rose-400 block">
                Audio & Music Rules
              </span>
              <p className="text-xs text-textMuted leading-relaxed">
                {campaign.guidelines.notes}
              </p>
              {campaign.guidelines.forbidden_audio.map((f, i) => (
                <div key={i} className="text-[11px] text-rose-300 font-mono bg-red-950/40 p-1.5 rounded-lg border border-red-500/20">
                  Forbidden: {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT CLIP DRAWER / FORM (Section 2C) */}
        <div className="rounded-xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-md shadow-limeAccent/20">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-textMain">
                Submit Published Clip Link
              </h3>
              <p className="text-xs text-textMuted">
                Paste your live X (Twitter), Instagram Reel, or YouTube Shorts link for automated view tracking & payouts
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
            <div className="rounded-xl bg-surfaceElevated border border-emeraldAccent/40 p-3 text-xs text-emeraldAccent flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emeraldAccent" />
              <span>
                Clip successfully submitted! Tracking automation has been initialized.
              </span>
            </div>
          )}

          <form onSubmit={handleClipSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain">
                  Published Video URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://x.com/username/status/12345678 or https://instagram.com/reel/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none font-mono"
                />

                {/* Real-time regex parsed feedback */}
                {parsedPreview && (
                  <div className="pt-1 flex items-center gap-2 text-[11px] font-mono">
                    {parsedPreview.isValid && parsedPreview.platform ? (
                      <span className="text-emeraldAccent font-semibold flex items-center gap-1">
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
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                  Initial View Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialViews}
                  onChange={(e) => setInitialViews(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                />
                <span className="text-[10px] text-textMuted mt-1 block font-mono">
                  Current views on link when submitted
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!joined}
              className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-3 text-xs flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {joined ? 'Submit Clip for Verification & Tracking' : 'Join Campaign First to Submit'}
              </span>
            </button>
          </form>
        </div>

        {/* PERSONAL EARNINGS & CLIPS DASHBOARD (Section 2C & Section 3) */}
        <div className="rounded-xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-limeAccent" />
                <h3 className="text-lg font-heading font-bold text-textMain">
                  Your Submitted Clips & Live View Tracking
                </h3>
              </div>
              <p className="text-xs text-textMuted">
                Automated background worker polls views and calculates CPM payouts
              </p>
            </div>

            {/* Creator Metrics Pills */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-1.5 text-right">
                <span className="text-[10px] uppercase font-heading font-bold text-textMuted">
                  Views on this Campaign
                </span>
                <div className="text-sm font-mono font-bold text-textMain">
                  {totalViewsInCampaign.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-1.5 text-right">
                <span className="text-[10px] uppercase font-heading font-bold text-textMuted">
                  Accrued Earnings
                </span>
                <div className="text-sm font-mono font-bold text-emeraldAccent">
                  ${totalEarnedInCampaign.toFixed(2)}
                </div>
              </div>

              {currentUser.role === 'creator' && currentUser.wallet_balance > 0 && (
                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="rounded-xl bg-emeraldAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-3 py-2 text-xs transition active:scale-[0.98] shadow-sm"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>

          {/* Submissions List */}
          {myCampaignSubmissions.length === 0 ? (
            <div className="py-12 text-center text-textMuted border border-dashed border-borderMuted rounded-xl">
              <Video className="h-8 w-8 mx-auto mb-2 opacity-40 text-textMuted" />
              <p className="text-xs font-semibold">
                You haven't submitted any clips for this campaign yet.
              </p>
              <p className="text-[11px] text-textMuted/70 mt-1">
                Download the raw footage above, edit a 30s short, publish it, and submit the link!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-borderMuted">
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
                          className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold border ${platMeta.badgeBg}`}
                        >
                          {platMeta.label}
                        </span>
                        <span className="text-xs font-mono text-textMuted truncate max-w-xs">
                          {sub.video_url}
                        </span>
                        <a
                          href={sub.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-textMuted hover:text-textMain"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-textMuted">
                        <span>
                          Current Views:{' '}
                          <strong className="text-textMain font-mono">
                            {sub.current_view_count.toLocaleString()}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Initial: {sub.initial_view_count.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          Net Eligible: <strong className="text-emeraldAccent font-mono">+{netViews.toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Accrued payout */}
                      <div className="text-right">
                        <div className="text-[10px] font-heading font-bold uppercase text-textMuted">
                          Accrued Payout
                        </div>
                        <div className="text-base font-mono font-bold text-emeraldAccent">
                          ${sub.earned_amount.toFixed(2)}
                        </div>
                      </div>

                      {/* Simulation Button for Testing the Automated Loop! */}
                      <button
                        onClick={() => simulateViewGrowth(sub.id, 15000)}
                        title="Simulate traffic spike / worker poll (+15,000 views)"
                        className="rounded-xl bg-surfaceElevated hover:bg-surface text-textMain border border-borderMuted px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-[0.98] hover:border-limeAccent"
                      >
                        <Zap className="h-3.5 w-3.5 text-limeAccent" />
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
    <Suspense fallback={<div className="min-h-screen bg-canvas text-textMuted flex items-center justify-center text-sm">Loading campaign workspace...</div>}>
      <CampaignWorkspaceContent {...props} />
    </Suspense>
  );
}
