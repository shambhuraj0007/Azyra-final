'use client';

import { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '../lib/CampaignContext';
import { SocialPlatform } from '../lib/types';

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

  // Step 3: Reward Model & Platforms
  const [cpmRate, setCpmRate] = useState<number>(1.50);
  const [totalBudget, setTotalBudget] = useState<number>(5000);
  const [maxPayoutPerClip, setMaxPayoutPerClip] = useState<number>(300);
  const [minViewsThreshold, setMinViewsThreshold] = useState<number>(2500);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['x', 'instagram', 'youtube_shorts']);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser?.isLoggedIn) {
      setErrorMsg('You must sign in or register before creating a campaign.');
      return;
    }

    const parsedHooks = parseList(hooksText);
    const parsedTalkingPoints = parseList(talkingPointsText);
    const parsedExamples = parseList(exampleVideosText);
    const parsedDos = parseList(dosText);
    const parsedDonts = parseList(dontsText);

    const res = await createCampaign({
      brand_id: currentUser.id || 'brand_default',
      brand_name: brandName || currentUser.name || 'Partner Brand',
      brand_logo: brandLogo || '⚡',
      brand_url: brandUrl,
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
      },
      total_budget: totalBudget,
      remaining_budget: totalBudget,
      cpm_rate: cpmRate,
      max_payout_per_clip: maxPayoutPerClip,
      min_views_threshold: minViewsThreshold,
      platforms,
      category,
      status: 'active',
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create campaign');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setStep(1);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-borderMuted bg-surface shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-textMuted hover:bg-surfaceElevated hover:text-textMain transition"
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-lg shadow-limeAccent/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-textMain">
                    Launch Creator Campaign
                  </h2>
                  <p className="text-xs text-textMuted">
                    Set up escrow rewards, viral hook briefs, raw video footage, and payout criteria for creators
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-4 gap-2 border-y border-borderMuted py-3 text-xs font-heading font-bold text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`transition ${step === 1 ? 'text-limeAccent' : 'text-textMuted hover:text-textMain'}`}
                >
                  1. Brand & Brief
                </button>
                <button
                  type="button"
                  onClick={() => title && setStep(2)}
                  className={`transition ${step === 2 ? 'text-limeAccent' : 'text-textMuted hover:text-textMain'}`}
                >
                  2. Creator Toolkit
                </button>
                <button
                  type="button"
                  onClick={() => title && setStep(3)}
                  className={`transition ${step === 3 ? 'text-limeAccent' : 'text-textMuted hover:text-textMain'}`}
                >
                  3. Reward Model
                </button>
                <button
                  type="button"
                  onClick={() => title && setStep(4)}
                  className={`transition ${step === 4 ? 'text-limeAccent' : 'text-textMuted hover:text-textMain'}`}
                >
                  4. Review & Launch
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
                    <span>Next: Reward Model (CPM)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Reward Model */}
            {step === 3 && (
              <div className="space-y-5">
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
                      Guarantees a single mega-viral video doesn't exhaust the full escrow
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
                          className={`rounded-xl px-4 py-2 text-xs font-heading font-bold border transition ${
                            selected
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

            {/* STEP 4: Review & Confirm Escrow */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                  </div>

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

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-textMuted hover:text-textMain flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-2xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-7 py-3.5 text-xs flex items-center gap-2 shadow-xl shadow-limeAccent/20 transition active:scale-[0.98]"
                  >
                    <Coins className="h-4 w-4" />
                    <span>Confirm Escrow Deposit & Launch Campaign</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
