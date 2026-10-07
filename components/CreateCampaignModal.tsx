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
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['tiktok', 'instagram', 'youtube_shorts']);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = createCampaign({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Campaign Escrow Funded!</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Your campaign <strong className="text-amber-400">{title}</strong> is now live on the marketplace with <strong className="text-white">${totalBudget.toLocaleString()}</strong> in secured escrow rewards.
            </p>
          </div>
        ) : (
          <div>
            {/* Header & Steps */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 font-black">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Launch New Creator Campaign
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Fund short-form clippers with escrow and automated CPM payouts
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-3 gap-2 border-y border-zinc-800 py-2.5 text-xs font-bold text-center">
                <div className={step === 1 ? 'text-amber-400' : 'text-zinc-500'}>
                  1. Brief & Assets
                </div>
                <div className={step === 2 ? 'text-amber-400' : 'text-zinc-500'}>
                  2. Reward Model (CPM)
                </div>
                <div className={step === 3 ? 'text-amber-400' : 'text-zinc-500'}>
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
                  <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cursor Composer Speedrun Viral Clips"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Brand / Product Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Product URL
                    </label>
                    <input
                      type="text"
                      value={brandUrl}
                      onChange={(e) => setBrandUrl(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                    Raw Video Asset Folder Link (Google Drive / S3) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={assetDriveLink}
                    onChange={(e) => setAssetDriveLink(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 outline-none font-mono"
                  />
                  <span className="text-[11px] text-zinc-500 mt-0.5 block">
                    Creators will download b-roll, demo recordings, and hook templates from this folder.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                    Campaign Description & Hook Angle
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe what clips perform best and what style you want clippers to produce..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Allowed / Required Hashtags
                    </label>
                    <input
                      type="text"
                      value={allowedHashtags}
                      onChange={(e) => setAllowedHashtags(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Accounts to Mention
                    </label>
                    <input
                      type="text"
                      value={accountsToMention}
                      onChange={(e) => setAccountsToMention(e.target.value)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    disabled={!title}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-5 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
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
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Pay-Per-View CPM Rate ($/1k views) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.10"
                        min="0.50"
                        value={cpmRate}
                        onChange={(e) => setCpmRate(parseFloat(e.target.value) || 1)}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:border-amber-400 outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Industry avg: $1.00 – $2.00 CPM
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Total Escrow Budget ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        step="500"
                        min="500"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 500)}
                        className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Max Payout Cap Per Clip ($)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={maxPayoutPerClip}
                      onChange={(e) => setMaxPayoutPerClip(parseFloat(e.target.value) || 100)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white font-mono font-bold focus:border-amber-400 outline-none"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Protects against single outlier videos exhausting budget
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                      Min Views Before Payout Unlocks
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={minViewsThreshold}
                      onChange={(e) => setMinViewsThreshold(parseInt(e.target.value) || 1000)}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white font-mono font-bold focus:border-amber-400 outline-none"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Filters out low-effort or bot clips
                    </span>
                  </div>
                </div>

                {/* Platforms selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-300 mb-1.5">
                    Target Platforms Allowed
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'tiktok', label: 'TikTok' },
                      { id: 'instagram', label: 'Instagram Reels' },
                      { id: 'youtube_shorts', label: 'YouTube Shorts' },
                    ].map((p) => {
                      const selected = platforms.includes(p.id as any);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlatform(p.id as any)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                            selected
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
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
                    className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-5 py-2.5 text-xs flex items-center gap-1.5"
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
                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                    <span>Escrow Deposit Breakdown</span>
                    <span className="text-emerald-400 text-[11px]">
                      Funds locked in smart escrow
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300 divide-y divide-zinc-900">
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Campaign Title:</span>
                      <span className="font-bold text-white">{title}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Configured CPM Rate:</span>
                      <span className="font-mono font-bold text-amber-400">
                        ${cpmRate.toFixed(2)} per 1k views
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Clip Max Cap / Min Views:</span>
                      <span className="font-mono text-zinc-200">
                        Cap: ${maxPayoutPerClip} • Min: {minViewsThreshold.toLocaleString()} views
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Estimated Total Views Funded:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ~{estimatedViews.toLocaleString()} organic views
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-sm">
                      <span className="font-bold text-white">Escrow Deposit Required:</span>
                      <span className="font-mono font-black text-amber-400 text-base">
                        ${totalBudget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-zinc-900 p-2.5 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Your Brand Available Balance:</span>
                    <strong className="font-mono text-white">
                      ${currentUser.wallet_balance.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black px-6 py-3 text-xs flex items-center gap-2 shadow-lg shadow-amber-400/25 transition active:scale-98"
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
