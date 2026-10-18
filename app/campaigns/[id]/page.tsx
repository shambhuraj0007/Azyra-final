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
  Lightbulb,
  Trash2,
  XCircle,
  CheckCheck,
  FileText,
  AlertTriangle
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import WithdrawModal from '../../../components/WithdrawModal';
import CreateCampaignModal from '../../../components/CreateCampaignModal';
import { useCampaigns } from '../../../lib/CampaignContext';
import AzyraLogo from '../../../components/AzyraLogo';
import { parseSocialUrl, formatPlatform } from '../../../lib/campaignUtils';
import { SocialPlatform } from '../../../lib/types';
import { toast, handleUnauthorized } from '@/lib/toast';

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
    verifySubmission,
    cancelSubmission,
    toggleCampaignStatus
  } = useCampaigns();

  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [reportedViews, setReportedViews] = useState<number>(0);
  const [proofNotes, setProofNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Sponsor Verification Hub State
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSubToApprove, setSelectedSubToApprove] = useState<any | null>(null);
  const [customVerifiedViews, setCustomVerifiedViews] = useState<number>(0);
  const [customApprovedPayout, setCustomApprovedPayout] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const [selectedSubToReject, setSelectedSubToReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState(false);

  const campaign = campaigns.find((c) => c.id === campaignId);

  // Determine if current user is the campaign creator/sponsor
  const isCampaignOwner = Boolean(
    currentUser?.isLoggedIn && campaign && (
      (campaign.brand_id && (campaign.brand_id === currentUser.id || campaign.brand_id === currentUser.email)) ||
      (campaign.brand_name && currentUser.name && campaign.brand_name.toLowerCase() === currentUser.name.toLowerCase()) ||
      currentUser.role === 'brand'
    )
  );

  // All submissions for this campaign (used by campaign sponsor)
  const allCampaignSubmissions = useMemo(() => {
    return submissions.filter((s) => s.campaign_id === campaignId);
  }, [submissions, campaignId]);

  // Filtered submissions for sponsor verification tab
  const filteredCampaignSubmissions = useMemo(() => {
    if (verificationFilter === 'pending') {
      return allCampaignSubmissions.filter((s) => s.verification_status === 'pending_review' || s.verification_status === 'verifying');
    }
    if (verificationFilter === 'approved') {
      return allCampaignSubmissions.filter((s) => s.verification_status === 'approved' || s.verification_status === 'paid' || s.verification_status === 'active');
    }
    if (verificationFilter === 'rejected') {
      return allCampaignSubmissions.filter((s) => s.verification_status === 'rejected');
    }
    return allCampaignSubmissions;
  }, [allCampaignSubmissions, verificationFilter]);

  const pendingCount = allCampaignSubmissions.filter((s) => s.verification_status === 'pending_review' || s.verification_status === 'verifying').length;
  const approvedCount = allCampaignSubmissions.filter((s) => s.verification_status === 'approved' || s.verification_status === 'paid' || s.verification_status === 'active').length;
  const rejectedCount = allCampaignSubmissions.filter((s) => s.verification_status === 'rejected').length;

  // Filter submissions by this creator for this campaign
  const myCampaignSubmissions = useMemo(() => {
    return submissions.filter(
      (s) => s.campaign_id === campaignId && (s.creator_id === currentUser.id || (currentUser.email && s.creator_id === currentUser.email))
    );
  }, [submissions, campaignId, currentUser.id, currentUser.email]);

  // Total views and earnings from this campaign by creator
  const totalEarnedInCampaign = myCampaignSubmissions.reduce(
    (acc, s) => acc + s.earned_amount,
    0
  );
  const totalViewsInCampaign = myCampaignSubmissions.reduce(
    (acc, s) => acc + (s.current_view_count || s.reported_views || 0),
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
  const isBrandOwner = isCampaignOwner;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleClipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!currentUser.isLoggedIn) {
      handleUnauthorized('Please sign in to submit your clip.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitClip({
      campaignId: campaign.id,
      videoUrl,
      initialViews: 0,
      reportedViews: Number(reportedViews) || 0,
      proofNotes: proofNotes.trim(),
    });
    setIsSubmitting(false);

    if (!res.success) {
      const err = res.error || 'Submission failed';
      setSubmitError(err);
      toast.error('Submission Failed', err);
      return;
    }

    toast.success('Clip Submitted!', 'Your video has been submitted for sponsor review & escrow verification.');
    setSubmitSuccess(true);
    setVideoUrl('');
    setReportedViews(0);
    setProofNotes('');
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  // Open approval modal and pre-calculate payout suggestion
  const openApproveModal = (sub: any) => {
    setSelectedSubToApprove(sub);
    const suggestedViews = sub.reported_views && sub.reported_views > 0
      ? sub.reported_views
      : (sub.current_view_count > 0 ? sub.current_view_count : 1000);
    setCustomVerifiedViews(suggestedViews);

    const netViews = Math.max(0, suggestedViews - (sub.initial_view_count || 0));
    const rawPayout = Number(((netViews / 1000) * campaign.cpm_rate).toFixed(2));
    const cappedPayout = Math.min(
      rawPayout,
      campaign.max_payout_per_clip,
      campaign.remaining_budget + (sub.earned_amount || 0)
    );
    setCustomApprovedPayout(cappedPayout);
  };

  const handleVerifiedViewsChange = (views: number) => {
    setCustomVerifiedViews(views);
    if (selectedSubToApprove) {
      const netViews = Math.max(0, views - (selectedSubToApprove.initial_view_count || 0));
      const rawPayout = Number(((netViews / 1000) * campaign.cpm_rate).toFixed(2));
      const cappedPayout = Math.min(
        rawPayout,
        campaign.max_payout_per_clip,
        campaign.remaining_budget + (selectedSubToApprove.earned_amount || 0)
      );
      setCustomApprovedPayout(cappedPayout);
    }
  };

  const handleConfirmApproval = async () => {
    if (!selectedSubToApprove) return;
    setIsVerifying(true);
    const res = await verifySubmission({
      submissionId: selectedSubToApprove.id,
      action: 'approve',
      verifiedViews: customVerifiedViews,
      approvedPayout: customApprovedPayout,
    });
    setIsVerifying(false);

    if (!res.success) {
      toast.error('Verification Failed', res.error || 'Failed to approve submission');
      return;
    }

    const feeAmt = Number((customApprovedPayout * 0.07).toFixed(2));
    const netAmt = Number((customApprovedPayout - feeAmt).toFixed(2));
    toast.success('Submission Approved & Paid', `$${customApprovedPayout.toFixed(2)} bounty released ($${netAmt.toFixed(2)} net to creator after 7% fee).`);
    setSelectedSubToApprove(null);
  };

  const handleConfirmRejection = async () => {
    if (!selectedSubToReject) return;
    setIsRejecting(true);
    const res = await verifySubmission({
      submissionId: selectedSubToReject.id,
      action: 'reject',
      rejectionReason: rejectionReason.trim() || 'Submission does not meet campaign brief or guidelines',
    });
    setIsRejecting(false);

    if (!res.success) {
      toast.error('Rejection Failed', res.error || 'Failed to reject submission');
      return;
    }

    toast.info('Submission Rejected', 'Status updated to rejected.');
    setSelectedSubToReject(null);
    setRejectionReason('');
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

          {/* CAMPAIGN SUCCESS CRITERIA & PAYOUT ELIGIBILITY */}
          {campaign.guidelines.success_criteria && (
            <div className="rounded-2xl border border-emeraldAccent/40 bg-gradient-to-r from-emeraldAccent/10 via-surface to-surface p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emeraldAccent" />
                  <h4 className="text-sm font-heading font-bold text-emerald-300 uppercase tracking-wider">
                    Campaign Success Criteria & Payout Eligibility
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-emeraldAccent bg-emeraldAccent/15 px-2.5 py-1 rounded-full border border-emeraldAccent/30 font-bold">
                  Escrow Rules
                </span>
              </div>
              <p className="text-xs text-textMuted">
                To unlock escrow rewards, your video submission must fulfill the following success criteria set by the brand:
              </p>
              <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-4 text-xs font-mono text-textMain leading-relaxed whitespace-pre-line">
                {campaign.guidelines.success_criteria}
              </div>
            </div>
          )}

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

              {/* Target Audience & Production Specs (Fills empty space) */}
              <div className="rounded-2xl border border-borderMuted bg-surface p-5 space-y-4 shadow-xl flex-1 flex flex-col justify-center">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 border-b border-borderMuted pb-2">
                  <Target className="h-4 w-4" />
                  <span>Production & Audience Specs</span>
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted mb-1">Target Audience</p>
                    <p className="text-xs text-textMain leading-relaxed font-medium">
                      {campaign.guidelines.target_audience || 'General broad audience. Focus on high retention and visual hooks.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-textMuted mb-1">Ideal Duration</p>
                    <p className="text-xs text-textMain font-mono bg-surfaceElevated border border-borderMuted p-1.5 rounded-lg inline-block">
                      {campaign.guidelines.video_duration || '30 - 60s (9:16 vertical)'}
                    </p>
                  </div>
                </div>

                {campaign.guidelines.media_kit_link && (
                  <div className="pt-2">
                    <a
                      href={campaign.guidelines.media_kit_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 border border-purple-900/40 py-2.5 text-xs font-bold transition shadow-sm"
                    >
                      <FolderDown className="h-4 w-4" />
                      Download Official Brand Assets
                    </a>
                  </div>
                )}
              </div>
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

        {/* SPONSOR VERIFICATION HUB (For Campaign Owner / Sponsor) */}
        {isCampaignOwner && (
          <div className="rounded-2xl border-2 border-limeAccent/30 bg-surface p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-limeAccent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-borderMuted pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-limeAccent/15 border border-limeAccent/30 text-limeAccent font-heading font-bold">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-limeAccent/10 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-limeAccent border border-limeAccent/30">
                    Sponsor Management
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-textMain tracking-tight">
                  Creator Submissions & Verification Hub
                </h3>
                <p className="text-xs sm:text-sm text-textMuted max-w-2xl">
                  As the campaign owner, inspect submitted creator links, verify view counts & guidelines, and release escrow bounty payouts.
                </p>
              </div>

              {/* Escrow summary pills */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3 min-w-[140px]">
                  <span className="text-[10px] uppercase font-heading font-bold text-textMuted block">
                    Escrow Remaining
                  </span>
                  <div className="text-lg font-mono font-bold text-limeAccent">
                    ${campaign.remaining_budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3 min-w-[130px]">
                  <span className="text-[10px] uppercase font-heading font-bold text-textMuted block">
                    Total Paid Out
                  </span>
                  <div className="text-lg font-mono font-bold text-emeraldAccent">
                    ${(campaign.total_paid_out || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3 min-w-[120px]">
                  <span className="text-[10px] uppercase font-heading font-bold text-textMuted block">
                    Pending Review
                  </span>
                  <div className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    {pendingCount > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />}
                    <span>{pendingCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setVerificationFilter('all')}
                className={`rounded-xl px-3.5 py-2 text-xs font-heading font-bold transition flex items-center gap-2 ${
                  verificationFilter === 'all'
                    ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20'
                    : 'bg-surfaceElevated text-textMuted hover:text-textMain border border-borderMuted'
                }`}
              >
                <span>All Submissions</span>
                <span className="rounded-full px-1.5 py-0.2 bg-black/20 text-[10px] font-mono">
                  {allCampaignSubmissions.length}
                </span>
              </button>

              <button
                onClick={() => setVerificationFilter('pending')}
                className={`rounded-xl px-3.5 py-2 text-xs font-heading font-bold transition flex items-center gap-2 ${
                  verificationFilter === 'pending'
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'bg-surfaceElevated text-textMuted hover:text-textMain border border-borderMuted'
                }`}
              >
                <span>Pending Review</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${pendingCount > 0 ? 'bg-amber-500/30 text-amber-300 font-bold' : 'bg-black/20'}`}>
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setVerificationFilter('approved')}
                className={`rounded-xl px-3.5 py-2 text-xs font-heading font-bold transition flex items-center gap-2 ${
                  verificationFilter === 'approved'
                    ? 'bg-emeraldAccent text-[#0B0F10] shadow-md shadow-emeraldAccent/20'
                    : 'bg-surfaceElevated text-textMuted hover:text-textMain border border-borderMuted'
                }`}
              >
                <span>Verified & Paid</span>
                <span className="rounded-full px-1.5 py-0.2 bg-black/20 text-[10px] font-mono">
                  {approvedCount}
                </span>
              </button>

              <button
                onClick={() => setVerificationFilter('rejected')}
                className={`rounded-xl px-3.5 py-2 text-xs font-heading font-bold transition flex items-center gap-2 ${
                  verificationFilter === 'rejected'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-surfaceElevated text-textMuted hover:text-textMain border border-borderMuted'
                }`}
              >
                <span>Rejected</span>
                <span className="rounded-full px-1.5 py-0.2 bg-black/20 text-[10px] font-mono">
                  {rejectedCount}
                </span>
              </button>
            </div>

            {/* Submissions List for Sponsor */}
            {filteredCampaignSubmissions.length === 0 ? (
              <div className="py-12 text-center text-textMuted border border-dashed border-borderMuted rounded-2xl bg-surfaceElevated/40">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30 text-limeAccent" />
                <p className="text-xs font-semibold text-textMain">
                  {verificationFilter === 'pending'
                    ? 'No submissions pending review! All caught up.'
                    : `No submissions found in ${verificationFilter} filter.`}
                </p>
                <p className="text-[11px] text-textMuted mt-1">
                  When creators submit their live video clips, they will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaignSubmissions.map((sub) => {
                  const platMeta = formatPlatform(sub.platform);
                  const isPending = sub.verification_status === 'pending_review' || sub.verification_status === 'verifying';
                  const isApproved = sub.verification_status === 'approved' || sub.verification_status === 'paid' || sub.verification_status === 'active';
                  const isRejected = sub.verification_status === 'rejected';

                  const reported = sub.reported_views || sub.current_view_count || 0;
                  const netViews = Math.max(0, reported - (sub.initial_view_count || 0));
                  const estimatedPayout = Math.min(
                    Number(((netViews / 1000) * campaign.cpm_rate).toFixed(2)),
                    campaign.max_payout_per_clip,
                    campaign.remaining_budget + (sub.earned_amount || 0)
                  );

                  return (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-borderMuted bg-surfaceElevated/70 p-5 sm:p-6 transition hover:border-limeAccent/40 space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Creator & Clip Details */}
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-heading font-bold text-sm text-textMain">
                              {sub.creator_name || 'Creator'}
                            </span>
                            {sub.creator_handle && (
                              <span className="text-xs font-mono text-limeAccent">
                                {sub.creator_handle.startsWith('@') ? sub.creator_handle : `@${sub.creator_handle}`}
                              </span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold border ${platMeta.badgeBg}`}>
                              {platMeta.label}
                            </span>
                            <span className="text-[11px] font-mono text-textMuted">
                              • Submitted {new Date(sub.submitted_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <a
                              href={sub.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-textMuted hover:text-limeAccent underline underline-offset-2 flex items-center gap-1 font-mono truncate max-w-md transition"
                            >
                              <span>{sub.video_url}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                            <a
                              href={sub.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 rounded-lg bg-surface hover:bg-canvas border border-borderMuted px-2.5 py-1 text-[11px] font-bold text-textMain hover:text-limeAccent flex items-center gap-1 transition shadow-sm"
                            >
                              <span>Watch Clip</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>

                          {/* Proof Notes if provided */}
                          {sub.proof_notes && (
                            <div className="rounded-xl bg-canvas/70 border border-borderMuted/80 p-2.5 text-xs text-textMuted flex items-start gap-2">
                              <FileText className="h-3.5 w-3.5 text-limeAccent shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <strong className="text-textMain font-heading">Creator Notes:</strong> {sub.proof_notes}
                              </div>
                            </div>
                          )}

                          {/* Rejection reason if rejected */}
                          {isRejected && sub.rejection_reason && (
                            <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-heading font-bold">Rejection Reason:</strong> {sub.rejection_reason}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Metrics and Action Buttons */}
                        <div className="flex flex-wrap md:flex-col items-end gap-3 shrink-0">
                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <span className="text-[10px] uppercase font-heading font-bold text-textMuted block">
                                Reported Views
                              </span>
                              <span className="text-base font-mono font-bold text-textMain">
                                {reported.toLocaleString()}
                              </span>
                            </div>

                            <div className="border-l border-borderMuted pl-4">
                              <span className="text-[10px] uppercase font-heading font-bold text-textMuted block">
                                {isApproved ? 'Gross Bounty' : 'Est. Bounty'}
                              </span>
                              <span className={`text-base font-mono font-bold ${isApproved ? 'text-emeraldAccent' : 'text-limeAccent'}`}>
                                ${isApproved ? sub.earned_amount.toFixed(2) : estimatedPayout.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-mono text-textMuted block">
                                Net: ${((isApproved ? (sub.net_payout || (sub.earned_amount * 0.93)) : (estimatedPayout * 0.93))).toFixed(2)} (7% fee)
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="w-full flex justify-end">
                            {isPending && (
                              <span className="rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 text-xs font-heading font-bold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Pending Your Review</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="rounded-full bg-emeraldAccent/15 text-emeraldAccent border border-emeraldAccent/30 px-3 py-1 text-xs font-heading font-bold flex items-center gap-1.5">
                                <CheckCheck className="h-3.5 w-3.5" />
                                <span>Verified & Escrow Released (${sub.earned_amount.toFixed(2)})</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 px-3 py-1 text-xs font-heading font-bold flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Rejected</span>
                              </span>
                            )}
                          </div>

                          {/* Verification Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => openApproveModal(sub)}
                                  className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-4 py-2 text-xs flex items-center gap-1.5 shadow-md shadow-limeAccent/20 transition active:scale-[0.98]"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Verify & Release Payout</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedSubToReject(sub);
                                    setRejectionReason('');
                                  }}
                                  className="rounded-xl bg-surface hover:bg-canvas text-rose-400 hover:text-rose-300 border border-borderMuted hover:border-rose-500/40 px-3 py-2 text-xs font-heading font-bold flex items-center gap-1 transition"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openApproveModal(sub)}
                                className="rounded-xl bg-surface hover:bg-canvas text-textMuted hover:text-textMain border border-borderMuted px-3 py-1.5 text-xs font-mono font-bold transition"
                              >
                                Re-evaluate / Adjust
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBMIT CLIP FORM (For Creators) */}
        <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-md shadow-limeAccent/20">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-textMain">
                Submit Published Clip for Sponsor Verification
              </h3>
              <p className="text-xs text-textMuted">
                Paste your live Instagram Reel, YouTube Shorts, or X link along with your view count. The campaign sponsor will review your clip and disburse the bounty payout.
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
                Clip successfully submitted! The campaign sponsor has been queued to verify your video and release the escrow payout.
              </span>
            </div>
          )}

          <form onSubmit={handleClipSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain">
                  Published Post URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://instagram.com/reel/... or https://youtube.com/shorts/... or https://x.com/..."
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
                  Current View Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 5000"
                  value={reportedViews || ''}
                  onChange={(e) => setReportedViews(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                />
                <span className="text-[10px] text-textMuted mt-1 block font-mono">
                  Current views on your video post
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain">
                Proof & Context Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Pinned comment included, reached 25k views, insights screenshot ready on request"
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none font-sans"
              />
              <span className="text-[10px] text-textMuted block">
                Provide any notes or proof details for the sponsor to expedite your verification.
              </span>
            </div>

            <button
              type="submit"
              disabled={!joined || isSubmitting}
              className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-3 text-xs flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-limeAccent/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {isSubmitting ? 'Submitting Clip...' : joined ? 'Submit Clip for Sponsor Verification' : 'Join Campaign First to Submit'}
              </span>
            </button>
          </form>
        </div>

        {/* CREATOR'S SUBMITTED CLIPS & STATUS */}
        <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-limeAccent" />
                <h3 className="text-lg font-heading font-bold text-textMain">
                  Your Submitted Clips & Status
                </h3>
              </div>
              <p className="text-xs text-textMuted">
                Review your submitted clips and track verification & escrow payouts from the campaign sponsor
              </p>
            </div>

            {/* Creator Metrics Pills */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-1.5 text-right">
                <span className="text-[10px] uppercase font-heading font-bold text-textMuted">
                  Reported Views
                </span>
                <div className="text-sm font-mono font-bold text-textMain">
                  {totalViewsInCampaign.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-1.5 text-right">
                <span className="text-[10px] uppercase font-heading font-bold text-textMuted">
                  Verified & Earned
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
            <div className="py-12 text-center text-textMuted border border-dashed border-borderMuted rounded-2xl bg-surfaceElevated/30">
              <Video className="h-8 w-8 mx-auto mb-2 opacity-40 text-textMuted" />
              <p className="text-xs font-semibold text-textMain">
                You haven't submitted any clips for this campaign yet.
              </p>
              <p className="text-[11px] text-textMuted mt-1">
                Download the raw footage above, edit a 30s short, publish it, and submit the link with your view count!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-borderMuted">
              {myCampaignSubmissions.map((sub) => {
                const platMeta = formatPlatform(sub.platform);
                const isPending = sub.verification_status === 'pending_review' || sub.verification_status === 'verifying';
                const isApproved = sub.verification_status === 'approved' || sub.verification_status === 'paid' || sub.verification_status === 'active';
                const isRejected = sub.verification_status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${platMeta.badgeBg}`}
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
                          className="text-textMuted hover:text-limeAccent transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-textMuted">
                        <span>
                          Reported Views:{' '}
                          <strong className="text-textMain font-mono">
                            {(sub.reported_views || sub.current_view_count).toLocaleString()}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Verification Status Banner */}
                      <div>
                        {isPending && (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 text-xs text-amber-300">
                            <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                            <span>Pending Sponsor Review — The campaign creator will verify your video views to disburse bounty payout.</span>
                          </div>
                        )}
                        {isApproved && (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-emeraldAccent/10 border border-emeraldAccent/30 px-3 py-1.5 text-xs text-emeraldAccent">
                            <CheckCheck className="h-3.5 w-3.5 text-emeraldAccent" />
                            <span>Verified & Paid! <strong>${(sub.net_payout || (sub.earned_amount * 0.93)).toFixed(2)}</strong> credited to your wallet (${sub.earned_amount.toFixed(2)} gross minus 7% platform fee).</span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300">
                            <XCircle className="h-3.5 w-3.5 text-rose-400" />
                            <span>Rejected: {sub.rejection_reason || 'Did not meet campaign brief or guidelines'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Payout Display */}
                      <div className="text-right">
                        <div className="text-[10px] font-heading font-bold uppercase text-textMuted">
                          {isApproved ? 'Net Earned' : 'Est. Net Payout'}
                        </div>
                        <div className={`text-base font-mono font-bold ${isApproved ? 'text-emeraldAccent' : 'text-textMuted'}`}>
                          ${(isApproved ? (sub.net_payout || (sub.earned_amount * 0.93)) : (
                            Math.min(
                              ((Math.max(0, (sub.reported_views || sub.current_view_count) - sub.initial_view_count) / 1000) * campaign.cpm_rate),
                              campaign.max_payout_per_clip
                            ) * 0.93
                          )).toFixed(2)}
                        </div>
                        <span className="text-[10px] font-mono text-textMuted block">
                          after 7% fee
                        </span>
                      </div>

                      {/* Cancel Submission Button (if pending) */}
                      {isPending && (
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel this submission?')) {
                              const res = await cancelSubmission(sub.id);
                              if (!res.success) {
                                toast.error('Cancel Failed', res.error || 'Could not cancel submission');
                              } else {
                                toast.info('Submission Cancelled', 'The video submission has been removed.');
                              }
                            }
                          }}
                          title="Cancel Submission"
                          className="rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-[0.98] hover:border-red-500/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SPONSOR APPROVAL MODAL */}
        {selectedSubToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-surface border-2 border-limeAccent/30 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-borderMuted pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-limeAccent/20 text-limeAccent">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-textMain">
                      Verify & Release Bounty Escrow
                    </h3>
                    <p className="text-xs text-textMuted">
                      Confirm views and disburse payout to creator
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubToApprove(null)}
                  className="text-textMuted hover:text-textMain p-1 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Clip preview summary */}
              <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-textMuted">Creator:</span>
                  <span className="font-heading font-bold text-textMain">
                    {selectedSubToApprove.creator_name} {selectedSubToApprove.creator_handle && `(${selectedSubToApprove.creator_handle})`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Video Clip:</span>
                  <a
                    href={selectedSubToApprove.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-limeAccent underline font-mono flex items-center gap-1"
                  >
                    <span>Open Live Video</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {selectedSubToApprove.proof_notes && (
                  <div className="pt-1 text-[11px] text-textMuted border-t border-borderMuted/60">
                    <strong className="text-textMain">Notes:</strong> {selectedSubToApprove.proof_notes}
                  </div>
                )}
              </div>

              {/* Editable verification fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Verified View Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customVerifiedViews}
                    onChange={(e) => handleVerifiedViewsChange(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-sm text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                  <span className="text-[10px] text-textMuted mt-1 block font-mono">
                    Reported by creator: {(selectedSubToApprove.reported_views || selectedSubToApprove.current_view_count || 0).toLocaleString()} views
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Approved Bounty Payout ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-textMuted font-mono text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={campaign.remaining_budget + (selectedSubToApprove.earned_amount || 0)}
                      value={customApprovedPayout}
                      onChange={(e) => setCustomApprovedPayout(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-8 pr-3.5 py-2.5 text-sm text-emeraldAccent font-mono font-bold focus:border-emeraldAccent outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-textMuted mt-1 block font-mono">
                    Based on campaign rate: ${campaign.cpm_rate}/1k views (cap: ${campaign.max_payout_per_clip})
                  </span>
                </div>
              </div>

              {/* 7% Fee Breakdown */}
              <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-textMuted">
                  <span>Gross Bounty Payout (from Escrow):</span>
                  <span className="font-mono font-bold text-textMain">${customApprovedPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span className="flex items-center gap-1">
                    <span>Azyra Platform Fee (7%):</span>
                  </span>
                  <span className="font-mono font-bold">-${(customApprovedPayout * 0.07).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-borderMuted pt-2 text-emeraldAccent">
                  <span className="font-heading font-bold">Net Credited to Creator:</span>
                  <span className="font-mono font-bold text-sm">${(customApprovedPayout * 0.93).toFixed(2)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-emeraldAccent/10 border border-emeraldAccent/30 p-3 text-xs text-emeraldAccent flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Confirming will deduct <strong>${customApprovedPayout.toFixed(2)}</strong> from escrow and credit <strong>${(customApprovedPayout * 0.93).toFixed(2)}</strong> directly to the creator's wallet (after 7% platform fee).
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubToApprove(null)}
                  className="rounded-xl bg-surfaceElevated hover:bg-surface text-textMuted hover:text-textMain border border-borderMuted px-4 py-2.5 text-xs font-heading font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isVerifying || customApprovedPayout < 0}
                  onClick={handleConfirmApproval}
                  className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-5 py-2.5 text-xs flex items-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98] disabled:opacity-40"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>{isVerifying ? 'Releasing Funds...' : `Confirm & Release $${customApprovedPayout.toFixed(2)} ($${(customApprovedPayout * 0.93).toFixed(2)} Net)`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SPONSOR REJECTION MODAL */}
        {selectedSubToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-surface border-2 border-rose-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-borderMuted pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                    <XCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-textMain">
                      Reject Clip Submission
                    </h3>
                    <p className="text-xs text-textMuted">
                      Specify reason for rejection so creator can adjust
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubToReject(null)}
                  className="text-textMuted hover:text-textMain p-1 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Select Reasons */}
              <div className="space-y-2">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMuted">
                  Quick Select Reason
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Did not meet campaign talking points',
                    'Missing required hashtag or account tag',
                    'Video is deleted or private',
                    'Low resolution / poor audio quality',
                    'Copyrighted music used',
                    'Artificial / unauthentic view spike',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition border ${
                        rejectionReason === preset
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                          : 'bg-surfaceElevated text-textMuted hover:text-textMain border-borderMuted'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain">
                  Detailed Reason / Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this submission was rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-rose-500 outline-none font-sans"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubToReject(null)}
                  className="rounded-xl bg-surfaceElevated hover:bg-surface text-textMuted hover:text-textMain border border-borderMuted px-4 py-2.5 text-xs font-heading font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRejecting}
                  onClick={handleConfirmRejection}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-heading font-bold px-5 py-2.5 text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition active:scale-[0.98] disabled:opacity-40"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{isRejecting ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
