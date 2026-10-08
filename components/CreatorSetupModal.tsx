'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  CreditCard,
  AtSign,
  Globe,
  Share2
} from 'lucide-react';
import { useCampaigns } from '../lib/CampaignContext';
import { SocialPlatform } from '../lib/types';
import Link from 'next/link';

export default function CreatorSetupModal() {
  const {
    currentUser,
    isSetupModalOpen,
    closeSetupModal,
    pendingCampaignId,
    saveProfile,
    login,
    campaigns
  } = useCampaigns();

  const [step, setStep] = useState<'login' | 'setup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState<SocialPlatform>('x');
  const [xLink, setXLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [payoutType, setPayoutType] = useState<'stripe' | 'paypal' | 'crypto' | 'bank'>('bank');
  const [payoutIdentifier, setPayoutIdentifier] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state with currentUser when modal opens
  useEffect(() => {
    if (isSetupModalOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (currentUser?.isLoggedIn) {
        setStep('setup');
        setEmail(currentUser.email || 'alex@azyra.io');
        setName(currentUser.name || 'Alex Rivera');
        setHandle(currentUser.handle?.replace('@', '') || 'alex_edits');
        setBio(currentUser.bio || 'Viral tech demo clippers & product walkthrough creator.');
        setPrimaryPlatform(currentUser.primaryPlatform || 'x');
        setXLink(currentUser.socialLinks?.x || 'https://x.com/alex_edits');
        setInstagramLink(currentUser.socialLinks?.instagram || '');
        setYoutubeLink(currentUser.socialLinks?.youtube || '');
        setPayoutType(currentUser.payoutMethod?.type || 'stripe');
        setPayoutIdentifier(currentUser.payoutMethod?.accountIdentifier || 'acct_1Nzk98WhopConnect');
      } else {
        setStep('login');
        setEmail(currentUser?.email || '');
        setName(currentUser?.name || '');
      }
    }
  }, [isSetupModalOpen, currentUser]);

  if (!isSetupModalOpen) return null;

  const targetCampaign = campaigns.find((c) => c.id === pendingCampaignId);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(email, name);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to authenticate user.');
      return;
    }

    // Advance to profile setup
    setStep('setup');
    if (res.user) {
      setName(res.user.name || name);
      setHandle(res.user.handle?.replace('@', '') || email.split('@')[0]);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your display name.');
      return;
    }
    if (!handle.trim()) {
      setErrorMsg('Please choose a creator handle.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;

    const res = await saveProfile({
      email: email.trim() || currentUser?.email || 'creator@azyra.io',
      name: name.trim(),
      handle: cleanHandle,
      bio: bio.trim(),
      primaryPlatform,
      socialLinks: {
        x: xLink.trim(),
        instagram: instagramLink.trim(),
        youtube: youtubeLink.trim(),
      },
      payoutMethod: {
        type: payoutType,
        accountIdentifier: payoutIdentifier.trim() || 'default_payout',
      },
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save creator profile.');
      return;
    }

    setSuccessMsg(
      targetCampaign
        ? `Profile verified! You have successfully joined "${targetCampaign.title}".`
        : 'Creator profile setup complete & saved to database!'
    );

    setTimeout(() => {
      closeSetupModal();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-borderMuted bg-surface shadow-2xl p-6 sm:p-8 my-8">
        <button
          onClick={closeSetupModal}
          className="absolute right-5 top-5 rounded-lg p-1.5 text-textMuted hover:bg-surfaceElevated hover:text-textMain transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold shadow-md shadow-limeAccent/20">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-limeAccent bg-limeAccent/10 px-2 py-0.5 rounded-full border border-limeAccent/20">
              Creator Verification
            </span>
            <h3 className="text-xl font-heading font-bold text-textMain mt-1">
              {step === 'login' ? 'Creator Sign In / Register' : 'Set Up Creator Profile'}
            </h3>
          </div>
        </div>

        {/* Step indicator tabs */}
        <div className="flex rounded-xl bg-surfaceElevated p-1 mb-4 border border-borderMuted">
          <button
            type="button"
            onClick={() => setStep('login')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-heading font-bold transition text-center ${step === 'login'
              ? 'bg-limeAccent text-[#0B0F10] shadow-sm'
              : 'text-textMuted hover:text-textMain'
              }`}
          >
            1. Sign In / Register
          </button>
          <button
            type="button"
            onClick={() => {
              if (!email) {
                setEmail(currentUser?.email || 'creator@azyra.io');
              }
              setStep('setup');
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-heading font-bold transition text-center ${step === 'setup'
              ? 'bg-limeAccent text-[#0B0F10] shadow-sm'
              : 'text-textMuted hover:text-textMain'
              }`}
          >
            2. Creator Profile Setup
          </button>
        </div>

        {targetCampaign && (
          <div className="mb-5 rounded-xl bg-surfaceElevated border border-limeAccent/30 p-3.5 flex items-center gap-3">
            <span className="text-xl">{targetCampaign.brand_logo}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-limeAccent font-semibold block">
                Joining Campaign
              </span>
              <p className="text-xs font-heading font-bold text-textMain truncate">
                {targetCampaign.title}
              </p>
              <p className="text-[11px] text-textMuted">
                CPM: <strong className="text-textMain font-mono">${targetCampaign.cpm_rate.toFixed(2)}</strong> • Pool: <strong className="text-textMain font-mono">${targetCampaign.remaining_budget.toLocaleString()}</strong>
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-surfaceElevated border border-emeraldAccent/40 p-3 text-xs text-emeraldAccent flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emeraldAccent" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: LOGIN */}
        {step === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <p className="text-xs text-textMuted leading-relaxed">
              Log in to your Azyra account to access creator campaigns, track automated views, and claim cash rewards.
            </p>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                Your Name / Brand (Optional)
              </label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href={`/login?redirect=/campaigns${targetCampaign ? `&join=${targetCampaign.id}` : ''}`}
                onClick={closeSetupModal}
                className="text-[11px] text-limeAccent hover:underline"
              >
                Go to Dedicated Login Page →
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-5 py-2.5 text-xs flex items-center gap-2 transition disabled:opacity-50 active:scale-[0.98]"
              >
                <span>{isLoading ? 'Verifying...' : 'Continue to Setup'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: CREATOR PROFILE SETUP */}
        {step === 'setup' && (
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <p className="text-xs text-textMuted leading-relaxed">
              Complete your creator profile so sponsors and campaigns can verify your clips and distribute payouts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                  Creator Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain focus:border-limeAccent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                  Creator Handle *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-textMuted font-mono">@</span>
                  <input
                    type="text"
                    required
                    placeholder="alex_edits"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace('@', ''))}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-7 pr-3 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                Bio / Content Niche
              </label>
              <textarea
                rows={2}
                placeholder="Productivity tools tester, SaaS walkthrough clipper, and viral tech reviewer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none"
              />
            </div>

            {/* Primary Platform & Handles */}
            <div className="space-y-2">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain">
                Primary Clipping Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'x', label: 'X (Twitter)' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'youtube_shorts', label: 'YouTube Shorts' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrimaryPlatform(p.id as any)}
                    className={`rounded-xl px-2.5 py-2 text-xs font-heading font-bold border text-center transition ${primaryPlatform === p.id
                      ? 'bg-limeAccent text-[#0B0F10] border-limeAccent'
                      : 'bg-surfaceElevated border-borderMuted text-textMuted hover:text-textMain'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                {primaryPlatform === 'x' && 'X (Twitter) Profile Link or @Handle *'}
                {primaryPlatform === 'instagram' && 'Instagram Reels Profile Link or @Handle *'}
                {primaryPlatform === 'youtube_shorts' && 'YouTube Shorts Channel Link *'}
              </label>
              <input
                type="text"
                placeholder={
                  primaryPlatform === 'x'
                    ? 'https://x.com/username or @handle'
                    : primaryPlatform === 'instagram'
                    ? 'https://instagram.com/username or @handle'
                    : 'https://youtube.com/@handle'
                }
                value={
                  primaryPlatform === 'x'
                    ? xLink
                    : primaryPlatform === 'instagram'
                    ? instagramLink
                    : youtubeLink
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (primaryPlatform === 'x') setXLink(val);
                  else if (primaryPlatform === 'instagram') setInstagramLink(val);
                  else if (primaryPlatform === 'youtube_shorts') setYoutubeLink(val);
                }}
                className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
              />
            </div>

            {/* Payout method */}
            <div>
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                Payout Destination *
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { id: 'bank', label: 'Bank' },
                  { id: 'stripe', label: 'Stripe' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'crypto', label: 'Crypto' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayoutType(m.id as any)}
                    className={`rounded-xl px-2 py-1.5 text-xs font-heading font-semibold border text-center transition ${payoutType === m.id
                      ? 'bg-surfaceElevated border-limeAccent text-limeAccent'
                      : 'bg-surfaceElevated/50 border-borderMuted text-textMuted hover:text-textMain'
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                placeholder={
                  payoutType === 'bank'
                    ? 'Bank name and account number'
                    : payoutType === 'stripe'
                    ? 'Stripe account ID or email (e.g. acct_1234...)'
                    : payoutType === 'paypal'
                      ? 'paypal-recipient@example.com'
                      : 'Solana or Ethereum wallet public key'
                }
                value={payoutIdentifier}
                onChange={(e) => setPayoutIdentifier(e.target.value)}
                className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-borderMuted">
              <Link
                href="/profile"
                onClick={closeSetupModal}
                className="text-xs text-textMuted hover:text-limeAccent transition underline underline-offset-4"
              >
                Go to Full Profile Page →
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-limeAccent/20 active:scale-[0.98]"
              >
                <span>
                  {isLoading
                    ? 'Saving to Database...'
                    : targetCampaign
                      ? 'Save & Join Campaign'
                      : 'Save Creator Profile'}
                </span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
