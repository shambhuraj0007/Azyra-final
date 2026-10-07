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
  Coins 
} from 'lucide-react';
import { useCampaigns } from '../lib/CampaignContext';
import { SocialPlatform } from '../lib/types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { currentUser, createCampaign } = useCampaigns();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Brief & Assets
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState(currentUser.name);
  const [brandUrl, setBrandUrl] = useState('https://cursor.com');
  const [assetDriveLink, setAssetDriveLink] = useState('https://drive.google.com/drive/folders/1DemoRawClips');
  const [allowedHashtags, setAllowedHashtags] = useState('#CursorAI, #CodingSpeedrun, #DevTok');
  const [accountsToMention, setAccountsToMention] = useState('@cursor_ai');
  const [forbiddenAudio, setForbiddenAudio] = useState('Copyrighted corporate music');
  const [guidelinesNotes, setGuidelinesNotes] = useState('Hook viewers in the first 3 seconds with a crazy code completion reaction.');

  // Step 2: Reward Model
  const [cpmRate, setCpmRate] = useState<number>(1.50);
  const [totalBudget, setTotalBudget] = useState<number>(5000);
  const [maxPayoutPerClip, setMaxPayoutPerClip] = useState<number>(300);
  const [minViewsThreshold, setMinViewsThreshold] = useState<number>(2500);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['x', 'instagram', 'youtube_shorts']);
  const [category, setCategory] = useState<any>('DevTools');

  // Step 3 submission status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const togglePlatform = (p: SocialPlatform) => {
    if (platforms.includes(p)) {
      if (platforms.length === 1) return; // Keep at least one
      setPlatforms(platforms.filter((item) => item !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const estimatedViews = Math.round((totalBudget / cpmRate) * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = await createCampaign({
      brand_id: currentUser.id,
      brand_name: brandName || currentUser.name,
      brand_logo: '⚡',
      brand_url: brandUrl,
      title,
      description,
      asset_drive_link: assetDriveLink,
      guidelines: {
        allowed_hashtags: allowedHashtags.split(',').map((s) => s.trim()).filter(Boolean),
        accounts_to_mention: accountsToMention.split(',').map((s) => s.trim()).filter(Boolean),
        forbidden_audio: [forbiddenAudio],
        requirements: [
          `Must post to ${platforms.join(' or ')}`,
          `Include tags: ${allowedHashtags}`,
          `Minimum view unlock: ${minViewsThreshold.toLocaleString()} views`,
        ],
        notes: guidelinesNotes,
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
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-borderMuted bg-surface shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-textMuted hover:bg-surfaceElevated hover:text-textMain transition"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emeraldAccent/15 text-emeraldAccent ring-2 ring-emeraldAccent/30 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-textMain">Campaign Escrow Funded!</h3>
            <p className="text-sm text-textMuted max-w-md mx-auto">
              Your campaign <strong className="text-limeAccent font-heading">{title}</strong> is now live on the marketplace with <strong className="text-textMain font-mono">${totalBudget.toLocaleString()}</strong> in secured escrow rewards.
            </p>
          </div>
        ) : (
          <div>
            {/* Header & Steps */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-md shadow-limeAccent/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-textMain">
                    Launch New Creator Campaign
                  </h2>
                  <p className="text-xs text-textMuted">
                    Fund short-form clippers with escrow and automated CPM payouts
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-3 gap-2 border-y border-borderMuted py-2.5 text-xs font-heading font-bold text-center">
                <div className={step === 1 ? 'text-limeAccent' : 'text-textMuted'}>
                  1. Brief & Assets
                </div>
                <div className={step === 2 ? 'text-limeAccent' : 'text-textMuted'}>
                  2. Reward Model (CPM)
                </div>
                <div className={step === 3 ? 'text-limeAccent' : 'text-textMuted'}>
                  3. Escrow Funding
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            {/* STEP 1: Brief & Assets */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cursor Composer Speedrun Viral Clips"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-sm text-textMain placeholder-textMuted/50 focus:border-limeAccent focus:ring-1 focus:ring-limeAccent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Brand / Product Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Product URL
                    </label>
                    <input
                      type="text"
                      value={brandUrl}
                      onChange={(e) => setBrandUrl(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
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
                  <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                    Raw Video Asset Folder Link (Google Drive / S3) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={assetDriveLink}
                    onChange={(e) => setAssetDriveLink(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain focus:border-limeAccent outline-none font-mono"
                  />
                  <span className="text-[11px] text-textMuted mt-0.5 block">
                    Creators will download b-roll, demo recordings, and hook templates from this folder.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                    Campaign Description & Hook Angle
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe what clips perform best and what style you want clippers to produce..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Allowed / Required Hashtags
                    </label>
                    <input
                      type="text"
                      value={allowedHashtags}
                      onChange={(e) => setAllowedHashtags(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Accounts to Mention
                    </label>
                    <input
                      type="text"
                      value={accountsToMention}
                      onChange={(e) => setAccountsToMention(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain focus:border-limeAccent outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={!title}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-5 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50 transition active:scale-[0.98]"
                  >
                    <span>Next: Reward Model</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Reward Model */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Pay-Per-View CPM Rate ($/1k views) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted font-mono text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.50"
                        value={cpmRate}
                        onChange={(e) => setCpmRate(parseFloat(e.target.value) || 1)}
                        className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-7 pr-3 py-2 text-sm text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-textMuted mt-1 block">
                      Industry avg: $1.00 – $2.00 CPM
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Total Escrow Budget ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted font-mono text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        step="500"
                        min="500"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 500)}
                        className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-7 pr-3 py-2 text-sm text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Max Payout Cap Per Clip ($)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={maxPayoutPerClip}
                      onChange={(e) => setMaxPayoutPerClip(parseFloat(e.target.value) || 100)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                    />
                    <span className="text-[10px] text-textMuted mt-1 block">
                      Protects against single outlier videos exhausting budget
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-textMain mb-1 font-heading">
                      Min Views Before Payout Unlocks
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={minViewsThreshold}
                      onChange={(e) => setMinViewsThreshold(parseInt(e.target.value) || 1000)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain font-mono font-bold focus:border-limeAccent outline-none"
                    />
                    <span className="text-[10px] text-textMuted mt-1 block">
                      Filters out low-effort or bot clips
                    </span>
                  </div>
                </div>

                {/* Platforms selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-textMain mb-1.5 font-heading">
                    Target Platforms Allowed
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`rounded-xl px-3 py-1.5 text-xs font-heading font-bold border transition ${
                            selected
                              ? 'bg-limeAccent text-[#0B0F10] border-limeAccent'
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
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-textMuted hover:text-textMain flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-5 py-2.5 text-xs flex items-center gap-1.5 transition active:scale-[0.98]"
                  >
                    <span>Next: Escrow Funding</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Escrow Funding & Review */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl bg-surfaceElevated border border-borderMuted p-4 space-y-3">
                  <div className="text-xs font-heading font-bold uppercase tracking-wider text-limeAccent flex items-center justify-between">
                    <span>Escrow Deposit Breakdown</span>
                    <span className="text-emeraldAccent text-[11px] font-mono">
                      Funds locked in smart escrow
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-textMuted divide-y divide-borderMuted">
                    <div className="flex justify-between py-1">
                      <span className="text-textMuted">Campaign Title:</span>
                      <span className="font-heading font-bold text-textMain">{title}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-textMuted">Configured CPM Rate:</span>
                      <span className="font-mono font-bold text-limeAccent">
                        ${cpmRate.toFixed(2)} per 1k views
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-textMuted">Clip Max Cap / Min Views:</span>
                      <span className="font-mono text-textMain">
                        Cap: ${maxPayoutPerClip} • Min: {minViewsThreshold.toLocaleString()} views
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-textMuted">Estimated Total Views Funded:</span>
                      <span className="font-mono font-bold text-emeraldAccent">
                        ~{estimatedViews.toLocaleString()} organic views
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-sm">
                      <span className="font-heading font-bold text-textMain">Escrow Deposit Required:</span>
                      <span className="font-mono font-bold text-limeAccent text-base">
                        ${totalBudget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-canvas p-2.5 text-[11px] text-textMuted border border-borderMuted flex items-center justify-between">
                    <span>Your Brand Available Balance:</span>
                    <strong className="font-mono text-textMain">
                      ${currentUser.wallet_balance.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-textMuted hover:text-textMain flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-3 text-xs flex items-center gap-2 shadow-lg shadow-limeAccent/20 transition active:scale-[0.98]"
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
