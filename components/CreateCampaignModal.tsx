'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  FolderDown,
  ShieldCheck,
  Video,
  Coins,
  Copy,
  Check,
  Flame,
  AlertTriangle,
  Lightbulb,
  Layers,
  ExternalLink,
  Target,
  Palette,
  Film,
  Lock,
  Globe,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '../lib/CampaignContext';
import { SocialPlatform } from '../lib/types';
import DodoCheckout from './DodoCheckout';
import { toast, handleUnauthorized } from '@/lib/toast';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const router = useRouter();
  const { currentUser, createCampaign } = useCampaigns();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Brand & Campaign Overview
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [brandName, setBrandName] = useState(currentUser.name || 'My Brand');
  const [brandLogo, setBrandLogo] = useState('⚡');
  const [brandUrl, setBrandUrl] = useState('https://example.com');
  const [category, setCategory] = useState<any>('DevTools');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('Developers, tech enthusiasts, and early adopters');
  const [browserTitle, setBrowserTitle] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  useEffect(() => {
    const clean = brandUrl.trim();
    if (!clean || !clean.includes('.') || clean === 'https://example.com' || clean.length < 5) {
      setBrowserTitle('');
      return;
    }

    const timer = setTimeout(async () => {
      setFetchingMetadata(true);
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.success && data.title) {
          setBrowserTitle(data.title);
          if (!brandName || brandName === 'My Brand') {
            setBrandName(data.siteName || data.title.split(/[-|•:]/)[0].trim());
          }
          if (!tagline && data.description) {
            setTagline(data.description.slice(0, 100));
          }
          if (!description && data.description) {
            setDescription(data.description);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingMetadata(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [brandUrl]);

  // Step 2: Creator Toolkit & Viral Strategy (The Creator Suite)
  const [assetDriveLink, setAssetDriveLink] = useState('https://drive.google.com/drive/folders/raw_footage_b_roll');
  const [mediaKitLink, setMediaKitLink] = useState('https://drive.google.com/drive/folders/brand_logos_overlays');

  // Hooks
  const [hooksText, setHooksText] = useState(
    '“I just deleted my old workflow and this is why...”\n' +
    '“Watch me build this full feature in 45 seconds using only prompts.”\n' +
    '“The secret tool senior engineers are quietly using in 2026.”'
  );

  // Talking points
  const [talkingPointsText, setTalkingPointsText] = useState(
    'Show live product UI in the first 3 seconds\n' +
    'Highlight the single biggest time-saving feature\n' +
    'Include realistic reaction to output speed and quality'
  );

  // Call to Action
  const [callToAction, setCallToAction] = useState('“Check the link in my bio to try it free today!”');

  // Example Videos (Inspirations)
  const [exampleVideosText, setExampleVideosText] = useState(
    'https://x.com/demo/status/183928172918237\n' +
    'https://www.instagram.com/reel/C3x9z_ABC123/'
  );

  // Do's & Don'ts
  const [dosText, setDosText] = useState(
    'Use large high-contrast animated subtitles\n' +
    'Keep video pacing rapid with quick jump cuts\n' +
    'High-resolution 1080p+ vertical format (9:16)\n' +
    'Natural webcam reaction or clear energetic voiceover'
  );

  const [dontsText, setDontsText] = useState(
    'No static slideshows or text-only slides\n' +
    'No copyrighted commercial music\n' +
    'Do not disparage direct competitors\n' +
    'No fake bot or engagement pod traffic'
  );

  // Rules & Tags
  const [allowedHashtags, setAllowedHashtags] = useState('#TechTok, #CodingSpeedrun, #AIProductivity, #BuildInPublic');
  const [accountsToMention, setAccountsToMention] = useState('@mybrand_official');
  const [forbiddenAudio, setForbiddenAudio] = useState('Copyrighted commercial pop songs, muffled low-bitrate audio');
  const [videoDuration, setVideoDuration] = useState('20 - 45 seconds (9:16 Vertical)');
  const [guidelinesNotes, setGuidelinesNotes] = useState('Hook the audience immediately in the first 2 seconds before they scroll.');

  // Step 3: Reward Model & Platforms (Two Primary Options)
  const [rewardModel, setRewardModel] = useState<'cpm' | 'custom_bounty'>('cpm');
  const [customBountyType, setCustomBountyType] = useState<'action' | 'fixed' | 'milestones'>('action');
  const [bountyAmount, setBountyAmount] = useState<number>(100);
  const [cpmRate, setCpmRate] = useState<number>(1.50);
  const [totalBudget, setTotalBudget] = useState<number>(5000);
  const [maxPayoutPerClip, setMaxPayoutPerClip] = useState<number>(300);
  const [minViewsThreshold, setMinViewsThreshold] = useState<number>(2500);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['x', 'instagram', 'youtube_shorts']);
  const [payoutStructure, setPayoutStructure] = useState<'cpm' | 'milestone' | 'hybrid'>('cpm');
  const [successCriteria, setSuccessCriteria] = useState(
    '1. Video must feature live product demonstration in the first 5 seconds.\n' +
    '2. Must include official CTA and link in bio or pinned comment.\n' +
    '3. Minimum view threshold of 2,500 views must be reached within 14 days.\n' +
    '4. Content must be 100% original with organic reach (zero engagement pods or bot traffic).'
  );

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Authentication Guard: Prevent unauthenticated users from creating campaigns
  if (!currentUser?.isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas/85 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-md rounded-3xl border border-borderMuted bg-surface shadow-2xl p-6 sm:p-8 text-center space-y-6">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl p-1.5 text-textMuted hover:bg-surfaceElevated hover:text-textMain transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-bold text-textMain">Sign In Required</h3>
            <p className="text-xs text-textMuted leading-relaxed max-w-sm mx-auto">
              You must be logged in to create and fund a creator campaign on Azyra. Please sign in or register your account to continue.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                router.push('/login?redirect=/campaigns&action=create');
              }}
              className="w-full rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-textMuted hover:text-textMain transition"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const togglePlatform = (p: SocialPlatform) => {
    if (platforms.includes(p)) {
      if (platforms.length === 1) return; // Keep at least one
      setPlatforms(platforms.filter((item) => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const estimatedViews = Math.round((totalBudget / cpmRate) * 1000);

  const parseList = (text: string) =>
    text
      .split('\n')
      .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);

  const executeCampaignCreation = async (escrowOrderId?: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    if (!currentUser?.isLoggedIn) {
      setIsSubmitting(false);
      onClose();
      handleUnauthorized('Please sign in or register to launch a campaign.');
      return;
    }

    const parsedHooks = parseList(hooksText);
    const parsedTalkingPoints = parseList(talkingPointsText);
    const parsedExamples = parseList(exampleVideosText);
    const parsedDos = parseList(dosText);
    const parsedDonts = parseList(dontsText);

    const execType = rewardModel === 'cpm' ? 'cpm_pool' : 'creator_direct';
    const numQuota = Math.floor(totalBudget / (bountyAmount || 1));

    const payoutMetric =
      execType === 'cpm_pool'
        ? {
            primary_label: 'Performance CPM',
            primary_value: `$${cpmRate.toFixed(2)} / 1K views`,
            action_type: 'view' as const,
          }
        : {
            primary_label: 'Custom Success Payout',
            primary_value: `$${bountyAmount.toLocaleString()} / Deal`,
            action_type: 'dedicated_video' as const,
            target_quota: numQuota,
            completed_quota: 0,
          };

    const res = await createCampaign({
      brand_id: currentUser.id || currentUser.email || 'brand_default',
      brand_name: brandName.trim() || currentUser.name || 'Partner Brand',
      brand_logo: brandLogo || '⚡',
      brand_url: brandUrl || 'https://example.com',
      title: title.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      asset_drive_link: assetDriveLink.trim(),
      guidelines: {
        allowed_hashtags: allowedHashtags.split(',').map((s) => s.trim()).filter(Boolean),
        accounts_to_mention: accountsToMention.split(',').map((s) => s.trim()).filter(Boolean),
        forbidden_audio: [forbiddenAudio],
        requirements: [
          `Post to ${platforms.join(' or ')}`,
          `Include tags: ${allowedHashtags}`,
          `Minimum view unlock: ${minViewsThreshold.toLocaleString()} views`,
          `Video length: ${videoDuration}`,
        ],
        notes: guidelinesNotes,
        hooks: parsedHooks,
        key_talking_points: parsedTalkingPoints,
        call_to_action: callToAction,
        dos: parsedDos,
        donts: parsedDonts,
        media_kit_link: mediaKitLink.trim() || undefined,
        example_videos: parsedExamples,
        video_duration: videoDuration,
        target_audience: targetAudience,
        success_criteria: successCriteria.trim(),
        payout_structure: rewardModel === 'cpm' ? 'cpm' : 'custom_success',
      },
      total_budget: totalBudget,
      remaining_budget: totalBudget,
      execution_type: execType,
      payout_metric: payoutMetric,
      bounty_rate: rewardModel !== 'cpm' ? bountyAmount : undefined,
      bounty_action: rewardModel !== 'cpm' ? 'Custom Success' : undefined,
      actions_remaining: rewardModel !== 'cpm' ? numQuota : undefined,
      flat_rate: rewardModel !== 'cpm' ? bountyAmount : undefined,
      deliverable_type: rewardModel !== 'cpm' ? 'Custom Success Deliverable' : undefined,
      cpm_rate: rewardModel === 'cpm' ? cpmRate : 0,
      max_payout_per_clip: rewardModel === 'cpm' ? maxPayoutPerClip : 0,
      min_views_threshold: rewardModel === 'cpm' ? minViewsThreshold : 0,
      platforms: platforms.length > 0 ? platforms : ['x', 'instagram', 'youtube_shorts'],
      category: category || 'DevTools',
      status: 'active',
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create campaign');
      toast.error('Campaign Creation Failed', res.error || 'Unable to publish campaign.');
      return;
    }

    toast.success('Campaign Launched!', `"${title.trim()}" is now live on the marketplace.`);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setStep(1);
      router.push('/campaigns?created=1');
    }, 1400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeCampaignCreation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-borderMuted bg-surface shadow-2xl p-4 sm:p-8 my-4 sm:my-8 max-h-[92dvh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 sm:right-5 top-4 sm:top-5 rounded-xl p-1.5 text-textMuted hover:bg-surfaceElevated hover:text-textMain transition"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-16 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emeraldAccent/15 text-emeraldAccent ring-4 ring-emeraldAccent/30 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-3xl font-heading font-bold text-textMain">Campaign Escrow Funded!</h3>
            <p className="text-sm text-textMuted max-w-lg mx-auto leading-relaxed">
              Your campaign <strong className="text-limeAccent font-heading">{title}</strong> is now live on the marketplace with <strong className="text-textMain font-mono">${totalBudget.toLocaleString()}</strong> in secured escrow rewards and complete creator implementation guidelines.
            </p>
          </div>
        ) : (
          <div>
            {/* Header & Steps */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-lg shadow-limeAccent/20 shrink-0">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-textMain">
                    Launch Creator Campaign
                  </h2>
                </div>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-4 gap-1 sm:gap-2 border-y border-borderMuted py-2.5 sm:py-3 text-[11px] sm:text-xs font-heading font-bold text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`transition py-1 rounded-lg ${step === 1 ? 'text-limeAccent bg-surfaceElevated/70' : 'text-textMuted hover:text-textMain'}`}
                >
                  <span className="sm:hidden">1. Brief</span>
                  <span className="hidden sm:inline">1. Brand & Brief</span>
                </button>
                <button
                  type="button"
                  onClick={() => title && setStep(2)}
                  className={`transition py-1 rounded-lg ${step === 2 ? 'text-limeAccent bg-surfaceElevated/70' : 'text-textMuted hover:text-textMain'}`}
                >
                  <span className="sm:hidden">2. Toolkit</span>
                  <span className="hidden sm:inline">2. Creator Toolkit</span>
                </button>
                <button
                  type="button"
                  onClick={() => title && setStep(3)}
                  className={`transition py-1 rounded-lg ${step === 3 ? 'text-limeAccent bg-surfaceElevated/70' : 'text-textMuted hover:text-textMain'}`}
                >
                  <span className="sm:hidden">3. Rewards</span>
                  <span className="hidden sm:inline">3. Reward & Success Model</span>
                </button>
                <button
                  type="button"
                  onClick={() => title && setStep(4)}
                  className={`transition py-1 rounded-lg ${step === 4 ? 'text-limeAccent bg-surfaceElevated/70' : 'text-textMuted hover:text-textMain'}`}
                >
                  <span className="sm:hidden">4. Review</span>
                  <span className="hidden sm:inline">4. Review & Launch</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-5 rounded-2xl bg-red-950/60 border border-red-500/40 p-4 text-xs text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Brand & Campaign Overview */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cursor Composer 10x Developer Speedrun Viral Clips"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-4 py-2.5 text-sm text-textMain placeholder-textMuted/50 focus:border-limeAccent focus:ring-1 focus:ring-limeAccent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                    One-Sentence Tagline / Hook
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The AI-first Code Editor built for hyper-productive engineers"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-4 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                      Logo Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={brandLogo}
                      onChange={(e) => setBrandLogo(e.target.value)}
                      className="w-full text-center rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-base text-textMain focus:border-limeAccent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                      Brand / Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                    >
                      <option value="AI & ML">AI & ML</option>
                      <option value="DevTools">DevTools</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Web3">Web3</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Fintech">Fintech</option>
                      <option value="Design">Design</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Marketing">Marketing</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                    Product / Landing Page URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={brandUrl}
                    onChange={(e) => setBrandUrl(e.target.value)}
                    placeholder="https://cursor.com"
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain focus:border-limeAccent outline-none font-mono"
                  />
                  {fetchingMetadata && (
                    <div className="flex items-center gap-1.5 pt-1.5 text-[11px] font-mono text-limeAccent animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Fetching page title & metadata...</span>
                    </div>
                  )}
                  {!fetchingMetadata && browserTitle && (
                    <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-surfaceElevated border border-borderMuted text-xs font-mono text-textMuted truncate">
                      <Globe className="h-3.5 w-3.5 text-limeAccent shrink-0" />
                      <span className="text-textMuted shrink-0">Title:</span>
                      <span className="text-textMain truncate font-medium">{browserTitle}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                    Campaign Description & Value Proposition *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain what the product does, what problems it solves, and why viewers should care..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software engineers, computer science students, AI builders"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={!title.trim() || !brandName.trim()}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50 transition active:scale-[0.98] shadow-md shadow-limeAccent/20"
                  >
                    <span>Next: Creator Toolkit & Hooks</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Creator Toolkit & Viral Strategy */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-surfaceElevated/70 border border-limeAccent/30 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-heading font-bold text-limeAccent">
                    <Sparkles className="h-4 w-4" />
                    <span>The Creator Success Suite</span>
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed">
                    Giving creators clear hooks, raw assets, and strict guidelines dramatically increases view counts and conversion quality.
                  </p>
                </div>

                {/* Asset Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading flex items-center gap-1.5">
                      <FolderDown className="h-3.5 w-3.5 text-limeAccent" />
                      <span>Raw Footage & B-Roll Link (Drive/S3) *</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/..."
                      value={assetDriveLink}
                      onChange={(e) => setAssetDriveLink(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                    />
                    <span className="text-[10px] text-textMuted mt-1 block">
                      Screen recordings, product clips, and sound bytes
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-emeraldAccent" />
                      <span>Brand Media Kit Link (Logos & Overlays)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={mediaKitLink}
                      onChange={(e) => setMediaKitLink(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                    />
                    <span className="text-[10px] text-textMuted mt-1 block">
                      Transparent PNG badges, intro motion stingers, and fonts
                    </span>
                  </div>
                </div>

                {/* Viral Opening Hooks */}
                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      <span>Recommended Opening Hooks (One per line)</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">First 3 seconds retainers</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="“I just deleted my old code editor...”&#10;“Never pay for this software again...”"
                    value={hooksText}
                    onChange={(e) => setHooksText(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>

                {/* Key Talking Points & Call To Action */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-limeAccent" />
                      <span>Key Talking Points to Feature</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="One point per line: What to show on screen..."
                      value={talkingPointsText}
                      onChange={(e) => setTalkingPointsText(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emeraldAccent" />
                      <span>Call-to-Action (CTA) for Viewers</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. “Check the link in my bio to test it free!”"
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                    />
                  </div>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-emeraldAccent mb-1.5 font-heading">
                      ✓ Creator Do's (Approval Boosters)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="One item per line: e.g. Dynamic animated captions..."
                      value={dosText}
                      onChange={(e) => setDosText(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-emeraldAccent/30 px-3 py-2 text-xs text-textMain focus:border-emeraldAccent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-red-400 mb-1.5 font-heading">
                      ✗ Creator Don'ts (Disqualification)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="One item per line: e.g. No copyrighted music..."
                      value={dontsText}
                      onChange={(e) => setDontsText(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-red-500/30 px-3 py-2 text-xs text-textMain focus:border-red-400 outline-none"
                    />
                  </div>
                </div>

                {/* Example Inspiration Videos */}
                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Inspirational Reference Video Links (Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Paste URLs to viral clips that nailed your desired style (one per line)..."
                    value={exampleVideosText}
                    onChange={(e) => setExampleVideosText(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>

                {/* Hashtags, Mentions, Video duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                      Required Hashtags
                    </label>
                    <input
                      type="text"
                      value={allowedHashtags}
                      onChange={(e) => setAllowedHashtags(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                      Tag Accounts
                    </label>
                    <input
                      type="text"
                      value={accountsToMention}
                      onChange={(e) => setAccountsToMention(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                      Video Duration
                    </label>
                    <input
                      type="text"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-textMuted hover:text-textMain flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-limeAccent/20"
                  >
                    <span>Next: Reward & Success Model</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Reward & Success Model */}
            {step === 3 && (
              <div className="space-y-5">
                {/* TWO-OPTION REWARD SWITCH BUTTON */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-textMain font-heading">
                      Reward & Compensation Model *
                    </label>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 p-1.5 rounded-2xl bg-canvas border border-borderMuted gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRewardModel('cpm');
                        setPayoutStructure('cpm');
                      }}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all ${rewardModel === 'cpm'
                        ? 'bg-limeAccent text-[#0B0F10] shadow-md shadow-limeAccent/20 scale-[1.01]'
                        : 'text-textMuted hover:text-textMain hover:bg-surfaceElevated'
                        }`}
                    >
                      <Coins className="h-4 w-4 shrink-0" />
                      <span>Pay-Per-View (CPM)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRewardModel('custom_bounty');
                        setPayoutStructure('milestone');
                        if (successCriteria.startsWith('1. Video must feature live product demonstration')) {
                          setSuccessCriteria(
                            '1. Feature genuine product workflow demonstration or Azyra checkout experience.\n' +
                            '2. Include official campaign tracking link in bio or pinned comment.\n' +
                            '3. Must deliver clear viewer value with 100% organic engagement (zero bots).\n' +
                            '4. Submit live post URL and analytics proof for escrow bounty release.'
                          );
                        }
                      }}
                      className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-heading font-bold transition-all ${rewardModel === 'custom_bounty'
                        ? 'bg-cyan-400 text-[#0B0F10] shadow-md shadow-cyan-400/20 scale-[1.01]'
                        : 'text-textMuted hover:text-textMain hover:bg-surfaceElevated'
                        }`}
                    >
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>Direct Sponsorship (Custom Success)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-textMuted mt-1.5 leading-relaxed font-sans">
                    {rewardModel === 'cpm'
                      ? 'Pay creators strictly based on verified view counts at an agreed dollar rate per views.'
                      : 'Define custom deliverables with Azyra: flat video bounties, customer checkouts, signups, or custom milestones where you set whatever rules you want.'}
                  </p>
                </div>

                {/* OPTION 1 SUB-OPTIONS: 1K PER VIEW MONEY (CPM) */}
                {rewardModel === 'cpm' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* CORE SUCCESS CRITERIA: Describe the success of the campaign for payout */}
                    <div className="rounded-2xl border border-emeraldAccent/30 bg-surfaceElevated/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase text-emeraldAccent font-heading flex items-center gap-1.5">
                          <Target className="h-4 w-4" />
                          <span>View Qualification & Quality Standards *</span>
                        </label>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          Required for View Escrow Release
                        </span>
                      </div>
                      <p className="text-[11px] text-textMuted leading-relaxed">
                        Specify quality standards that creators must hit for their views to count towards CPM payout.
                      </p>

                      <textarea
                        rows={3}
                        required
                        placeholder="Describe what makes views eligible for payout (e.g. video retention, product demo, CTA link in bio, organic reach)..."
                        value={successCriteria}
                        onChange={(e) => setSuccessCriteria(e.target.value)}
                        className="w-full rounded-xl bg-canvas border border-borderMuted px-3.5 py-2.5 text-xs text-textMain leading-relaxed focus:border-emeraldAccent outline-none font-mono"
                      />


                    </div>

                    {/* CPM & Budget Parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                          Pay-Per-View CPM Rate ($/1,000 views) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted font-mono text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.10"
                            min="0.50"
                            value={cpmRate}
                            onChange={(e) => setCpmRate(parseFloat(e.target.value) || 1)}
                            className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-8 pr-3 py-2.5 text-sm text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-textMuted mt-1 block">
                          Industry avg: $1.20 – $2.00 CPM for tech / SaaS
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                          Total Escrow Pool Budget ($) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted font-mono text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="500"
                            min="500"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 500)}
                            className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-8 pr-3 py-2.5 text-sm text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-emeraldAccent mt-1 block font-mono">
                          Funds approximately ~{estimatedViews.toLocaleString()} organic views
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                          Max Payout Cap Per Clip ($)
                        </label>
                        <input
                          type="number"
                          step="50"
                          value={maxPayoutPerClip}
                          onChange={(e) => setMaxPayoutPerClip(parseFloat(e.target.value) || 100)}
                          className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                        />
                        <span className="text-[10px] text-textMuted mt-1 block">
                          Guarantees a single mega-viral video doesn&apos;t exhaust the full escrow
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                          Min Views Before Payout Unlocks
                        </label>
                        <input
                          type="number"
                          step="500"
                          value={minViewsThreshold}
                          onChange={(e) => setMinViewsThreshold(parseInt(e.target.value, 10) || 1000)}
                          className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                        />
                        <span className="text-[10px] text-textMuted mt-1 block">
                          Protects against low-effort spam clips with 10 views
                        </span>
                      </div>
                    </div>

                    {/* Creator Success Tiers Preview */}
                    <div className="rounded-2xl bg-canvas border border-borderMuted p-4 space-y-2 font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-textMuted font-bold block">
                        Creator Success Payout Progression (Preview)
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-surfaceElevated p-2 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block font-heading">Tier 1: Min Unlock</span>
                          <span className="text-textMain font-bold">{minViewsThreshold.toLocaleString()} views</span>
                          <span className="text-emerald-400 font-bold block mt-0.5">
                            ${((minViewsThreshold / 1000) * cpmRate).toFixed(2)}
                          </span>
                        </div>
                        <div className="rounded-xl bg-surfaceElevated p-2 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block font-heading">Tier 2: Viral Growth</span>
                          <span className="text-textMain font-bold">25,000 views</span>
                          <span className="text-limeAccent font-bold block mt-0.5">
                            ${Math.min(maxPayoutPerClip, 25 * cpmRate).toFixed(2)}
                          </span>
                        </div>
                        <div className="rounded-xl bg-surfaceElevated p-2 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block font-heading">Tier 3: Mega Viral</span>
                          <span className="text-textMain font-bold">100,000+ views</span>
                          <span className="text-amber-400 font-bold block mt-0.5">
                            ${maxPayoutPerClip} (Max Cap)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION 2 SUB-OPTIONS: CUSTOM SUCCESS / BOUNTIES (AZYRA PROTOCOL) */}
                {rewardModel === 'custom_bounty' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Custom Bounty Type Pills */}


                    {/* Company Custom Success Description (Describe Whatever They Want) */}
                    <div className="rounded-2xl border border-limeAccent/30 bg-surfaceElevated/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase text-limeAccent font-heading flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" />
                          <span>Describe Your Custom Campaign Success Criteria *</span>
                        </label>
                        <span className="text-[10px] font-mono text-limeAccent bg-limeAccent/10 px-2 py-0.5 rounded border border-limeAccent/30">
                          100% Brand Controlled
                        </span>
                      </div>
                      <p className="text-[11px] text-textMuted leading-relaxed">
                        Describe whatever you want creators to accomplish for payout. You define the exact rules, deliverables, checkout proofs, or actions needed to unlock escrow funds.
                      </p>

                      <textarea
                        rows={4}
                        required
                        placeholder="Define your custom requirements (e.g. 1. Show live product demo, 2. Feature custom bio link, 3. Must be high retention organic video, 4. Submit screenshot proof of sales/members)..."
                        value={successCriteria}
                        onChange={(e) => setSuccessCriteria(e.target.value)}
                        className="w-full rounded-xl bg-canvas border border-borderMuted px-3.5 py-2.5 text-xs text-textMain leading-relaxed focus:border-limeAccent outline-none font-mono"
                      />

                    </div>

                    {/* Custom Bounty & Budget Parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                          Bounty Payout per Approved Submission ($) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted font-mono text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="10"
                            min="10"
                            value={bountyAmount}
                            onChange={(e) => setBountyAmount(parseFloat(e.target.value) || 50)}
                            className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-8 pr-3 py-2.5 text-sm text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-textMuted mt-1 block">
                          Fixed bounty released once creator meets your success criteria
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                          Total Escrow Pool Budget ($) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted font-mono text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="500"
                            min="250"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 500)}
                            className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-8 pr-3 py-2.5 text-sm text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-limeAccent mt-1 block font-mono">
                          Funds up to {Math.floor(totalBudget / (bountyAmount || 1))} approved creator submissions
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-2 font-heading">
                    Target Platforms Allowed for Submissions
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: 'x', label: 'X (Twitter)' },
                      { id: 'instagram', label: 'Instagram Reels' },
                      { id: 'youtube_shorts', label: 'YouTube Shorts' },
                    ].map((p) => {
                      const selected = platforms.includes(p.id as any);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlatform(p.id as any)}
                          className={`rounded-xl px-4 py-2 text-xs font-heading font-bold border transition ${selected
                            ? 'bg-limeAccent text-[#0B0F10] border-limeAccent shadow-md shadow-limeAccent/20'
                            : 'bg-surfaceElevated border-borderMuted text-textMuted hover:text-textMain'
                            }`}
                        >
                          {p.label} {selected ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-textMuted hover:text-textMain flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-limeAccent/20"
                  >
                    <span>Next: Review & Escrow</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Fund Escrow via Gateway (No Simulations) */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-surfaceElevated border border-borderMuted p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-borderMuted">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 rounded-xl bg-canvas border border-borderMuted">
                        {brandLogo}
                      </span>
                      <div>
                        <h4 className="text-sm font-heading font-bold text-textMain">{title}</h4>
                        <p className="text-[11px] text-textMuted">{brandName} • {category}</p>
                      </div>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-emeraldAccent/15 text-emeraldAccent border border-emeraldAccent/30">
                      Escrow Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {rewardModel === 'cpm' ? (
                      <>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">CPM Rate</span>
                          <strong className="text-sm font-mono text-limeAccent font-bold">${cpmRate.toFixed(2)}</strong>
                        </div>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Total Escrow</span>
                          <strong className="text-sm font-mono text-textMain font-bold">${totalBudget.toLocaleString()}</strong>
                        </div>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Per Clip Cap</span>
                          <strong className="text-sm font-mono text-textMain font-bold">${maxPayoutPerClip}</strong>
                        </div>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Min Views</span>
                          <strong className="text-sm font-mono text-emeraldAccent font-bold">{minViewsThreshold.toLocaleString()}</strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Payout Model</span>
                          <strong className="text-xs font-heading text-limeAccent font-bold">Azyra Custom</strong>
                        </div>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Bounty / Clip</span>
                          <strong className="text-sm font-mono text-limeAccent font-bold">${bountyAmount}</strong>
                        </div>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Total Escrow</span>
                          <strong className="text-sm font-mono text-textMain font-bold">${totalBudget.toLocaleString()}</strong>
                        </div>
                        <div className="rounded-xl bg-canvas p-2.5 border border-borderMuted">
                          <span className="text-[10px] text-textMuted block uppercase font-heading">Submissions</span>
                          <strong className="text-sm font-mono text-emeraldAccent font-bold">{Math.floor(totalBudget / (bountyAmount || 1))} clips</strong>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Success Criteria Summary in Step 4 */}
                  {successCriteria && (
                    <div className="rounded-xl bg-canvas p-3 border border-emerald-500/30 space-y-1">
                      <span className="text-[10px] font-heading font-bold uppercase text-emerald-400 block">
                        Defined Success & Payout Criteria:
                      </span>
                      <p className="text-xs text-textMuted leading-relaxed whitespace-pre-line font-mono">
                        {successCriteria}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-textMuted border-t border-borderMuted pt-3">
                    <div className="flex justify-between">
                      <span>Raw Footage & B-Roll:</span>
                      <span className="font-mono text-textMain truncate max-w-[280px]">{assetDriveLink}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Opening Viral Hooks Configured:</span>
                      <span className="text-limeAccent font-bold">{parseList(hooksText).length} hooks</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Platforms:</span>
                      <span className="text-textMain font-bold">{platforms.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Hashtags:</span>
                      <span className="font-mono text-textMain">{allowedHashtags}</span>
                    </div>
                  </div>
                </div>

                {/* Escrow Activation & Funding Controls */}
                <div className="space-y-4">
                  {/* Primary Instant Launch Action */}
                  <div className="rounded-2xl border-2 border-limeAccent/50 bg-surfaceElevated p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-limeAccent/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-heading font-extrabold text-textMain">
                            Instant Escrow Launch & Publish
                          </span>
                          <span className="text-[10px] font-mono font-bold text-limeAccent bg-limeAccent/15 px-2 py-0.5 rounded-full border border-limeAccent/30">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-textMuted mt-1 leading-relaxed">
                          Locks <strong className="text-textMain font-mono">${totalBudget.toLocaleString()} USD</strong> into campaign escrow and makes your campaign instantly visible and active on the marketplace.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => executeCampaignCreation()}
                      className="w-full cursor-pointer rounded-2xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-extrabold py-4 px-6 text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-limeAccent/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Securing Escrow & Launching Campaign...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 stroke-[2.5]" />
                          <span>Confirm & Launch Campaign (${totalBudget.toLocaleString()})</span>
                          <ArrowRight className="h-4 w-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Alternative Card Checkout Rail via Dodo Payments */}
                  <div className="rounded-2xl border border-borderMuted bg-surface/80 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-heading font-bold text-textMain block">
                          Or Pay via Card / Apple Pay (Dodo Payments)
                        </span>
                        <span className="text-[11px] text-textMuted">
                          External card authorization and international settlement.
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-limeAccent bg-limeAccent/10 px-2 py-0.5 rounded border border-limeAccent/30 hidden sm:inline">
                        PCI-DSS Level 1
                      </span>
                    </div>

                    <DodoCheckout
                      amountUsd={totalBudget}
                      type="campaign_escrow"
                      campaignTitle={title}
                      redirectUrl="/campaigns?escrow_success=1"
                      metadata={{
                        campaign_title: title,
                        total_budget: totalBudget,
                        reward_model: rewardModel,
                        cpm_rate: rewardModel === 'cpm' ? cpmRate : bountyAmount,
                        custom_bounty_type: rewardModel === 'custom_bounty' ? customBountyType : undefined,
                      }}
                      onSuccess={(orderId) => {
                        executeCampaignCreation(orderId);
                      }}
                      onError={(err) => {
                        setErrorMsg(`Payment error: ${err}`);
                        toast.error('Escrow Payment Failed', err);
                      }}
                    />
                  </div>

                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs font-bold text-textMuted hover:text-textMain flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Reward Model</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
