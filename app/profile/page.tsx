'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Video,
  Layers,
  Share2,
  CreditCard,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogOut,
  Save,
  Clock,
  Eye,
  AtSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import WithdrawModal from '../../components/WithdrawModal';
import { useCampaigns } from '../../lib/CampaignContext';
import { SocialPlatform } from '../../lib/types';
import { formatPlatform } from '../../lib/campaignUtils';

export default function ProfilePage() {
  const {
    currentUser,
    switchRole,
    campaigns,
    submissions,
    isJoined,
    saveProfile,
    login,
    logout,
    openSetupModal
  } = useCampaigns();

  const [activeTab, setActiveTab] = useState<'details' | 'campaigns' | 'clips' | 'wallet'>('details');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Form states for profile editing
  const [name, setName] = useState(currentUser?.name || '');
  const [handle, setHandle] = useState(currentUser?.handle || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [primaryPlatform, setPrimaryPlatform] = useState<SocialPlatform>(currentUser?.primaryPlatform || 'x');
  const [xLink, setXLink] = useState(currentUser?.socialLinks?.x || '');
  const [instagramLink, setInstagramLink] = useState(currentUser?.socialLinks?.instagram || '');
  const [youtubeLink, setYoutubeLink] = useState(currentUser?.socialLinks?.youtube || '');
  const [payoutType, setPayoutType] = useState<'stripe' | 'paypal' | 'crypto'>(currentUser?.payoutMethod?.type || 'stripe');
  const [payoutIdentifier, setPayoutIdentifier] = useState(currentUser?.payoutMethod?.accountIdentifier || '');

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Joined campaigns list
  const joinedCampaignsList = campaigns.filter((c) => isJoined(c.id));

  // User's submissions
  const userSubmissions = submissions.filter((s) => s.creator_id === currentUser.id);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg(null);

    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;

    const res = await saveProfile({
      email: email.trim() || currentUser.email || 'creator@azyra.io',
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
        accountIdentifier: payoutIdentifier.trim(),
      },
    });

    setIsSaving(false);

    if (res.success) {
      setFeedbackMsg({
        type: 'success',
        text: 'Creator profile changes saved to MongoDB database successfully.',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to save changes to database.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* PROMPT BANNER: If not logged in or profile setup pending */}
        {!currentUser?.isLoggedIn ? (
          <div className="rounded-2xl bg-amber-950/40 border border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-heading font-bold text-amber-200">
                  Guest Mode • Sign in to save creator profile
                </h4>
                <p className="text-xs text-amber-300/80">
                  Log in or register your creator account so all your campaign earnings, clips, and view tracking persist in the database.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/login?redirect=/profile"
                className="rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold text-xs px-4 py-2 hover:brightness-110 transition whitespace-nowrap shadow-sm shadow-limeAccent/20"
              >
                Sign In to Account →
              </Link>
              <button
                onClick={() => openSetupModal()}
                className="rounded-xl bg-surfaceElevated border border-borderMuted text-textMain font-heading font-bold text-xs px-3.5 py-2 hover:text-limeAccent transition whitespace-nowrap"
              >
                Quick Setup
              </button>
            </div>
          </div>
        ) : !currentUser?.isProfileSetup ? (
          <div className="rounded-2xl bg-surfaceElevated border border-limeAccent/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-limeAccent shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-sm font-heading font-bold text-textMain">
                  Creator Profile Setup Incomplete
                </h4>
                <p className="text-xs text-textMuted">
                  Please link your social clipping handles (X, Reels, Shorts) and choose a payout method below to unlock direct campaign joining.
                </p>
              </div>
            </div>
            <button
              onClick={() => openSetupModal()}
              className="rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold text-xs px-4 py-2 hover:brightness-110 transition whitespace-nowrap self-start sm:self-auto shadow-sm shadow-limeAccent/20"
            >
              Quick Setup Wizard →
            </button>
          </div>
        ) : null}

        {/* HERO PROFILE HEADER */}
        <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-surfaceElevated border border-borderMuted text-3xl sm:text-4xl shadow-inner">
                  {currentUser?.avatar || '🎬'}
                </div>
                {currentUser?.isProfileSetup && (
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-limeAccent text-[#0B0F10] ring-4 ring-surface" title="Verified Creator Profile">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-heading font-bold text-textMain">
                    {currentUser?.name || 'Anonymous Creator'}
                  </h1>
                  <span className="rounded-md bg-limeAccent/10 px-2 py-0.5 text-[10px] font-mono font-bold text-limeAccent border border-limeAccent/20 uppercase">
                    {currentUser?.role || 'creator'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-textMuted font-mono">
                  <span>{currentUser?.handle || '@handle'}</span>
                  <span>•</span>
                  <span>{currentUser?.email || 'no-email@azyra.io'}</span>
                </div>
                <p className="text-xs text-textMuted max-w-lg mt-1 line-clamp-2">
                  {currentUser?.bio || 'No bio specified. Edit your profile to introduce yourself to sponsor brands.'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => switchRole(currentUser?.role === 'creator' ? 'brand' : 'creator')}
                className="rounded-xl border border-borderMuted bg-surfaceElevated px-3 py-2 text-xs font-heading text-textMuted hover:text-textMain transition"
              >
                Switch to {currentUser?.role === 'creator' ? 'Brand Mode' : 'Creator Mode'}
              </button>

              {currentUser?.isLoggedIn ? (
                <button
                  onClick={logout}
                  className="rounded-xl border border-borderMuted bg-surfaceElevated hover:border-red-500/40 hover:text-red-300 px-3 py-2 text-xs font-heading text-textMuted flex items-center gap-1.5 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              ) : (
                <button
                  onClick={() => openSetupModal()}
                  className="rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold px-4 py-2 text-xs transition hover:brightness-110 shadow-sm"
                >
                  Log In
                </button>
              )}
            </div>
          </div>

          {/* STATS TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-borderMuted">
            <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
              <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                <Eye className="h-3.5 w-3.5 text-limeAccent" />
                <span>Total Views Tracked</span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-bold text-textMain">
                {(currentUser?.total_views_generated || 0).toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
              <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                <DollarSign className="h-3.5 w-3.5 text-emeraldAccent" />
                <span>Wallet Balance</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg sm:text-xl font-mono font-bold text-emeraldAccent">
                  ${(currentUser?.wallet_balance || 0).toFixed(2)}
                </div>
                {(currentUser?.wallet_balance || 0) > 0 && (
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="text-[10px] font-heading font-bold text-limeAccent hover:underline"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
              <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-limeAccent" />
                <span>Total Earned</span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-bold text-textMain">
                ${(currentUser?.total_earned || 0).toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
              <div className="flex items-center gap-2 text-textMuted text-xs mb-1">
                <Layers className="h-3.5 w-3.5 text-limeAccent" />
                <span>Campaigns Joined</span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-bold text-textMain">
                {joinedCampaignsList.length}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-borderMuted gap-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition ${activeTab === 'details'
                ? 'border-limeAccent text-limeAccent'
                : 'border-transparent text-textMuted hover:text-textMain'
              }`}
          >
            <Settings className="h-4 w-4" />
            <span>Profile & Social Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition ${activeTab === 'campaigns'
                ? 'border-limeAccent text-limeAccent'
                : 'border-transparent text-textMuted hover:text-textMain'
              }`}
          >
            <Layers className="h-4 w-4" />
            <span>My Joined Campaigns ({joinedCampaignsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition ${activeTab === 'clips'
                ? 'border-limeAccent text-limeAccent'
                : 'border-transparent text-textMuted hover:text-textMain'
              }`}
          >
            <Video className="h-4 w-4" />
            <span>Submitted Clips ({userSubmissions.length})</span>
          </button>
        </div>

        {/* TAB CONTENT: PROFILE & SOCIAL SETTINGS */}
        {activeTab === 'details' && (
          <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-heading font-bold text-textMain">
                Creator Profile & Payout Information
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                Update your public identity, verified social handles, and payout destinations. Synced with MongoDB.
              </p>
            </div>

            {feedbackMsg && (
              <div
                className={`rounded-xl p-3.5 text-xs flex items-center gap-2 border ${feedbackMsg.type === 'success'
                    ? 'bg-surfaceElevated border-emeraldAccent/40 text-emeraldAccent'
                    : 'bg-red-950/60 border-red-500/40 text-red-200'
                  }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emeraldAccent shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain focus:border-limeAccent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Creator Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-textMuted font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={handle.replace('@', '')}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full rounded-xl bg-surfaceElevated border border-borderMuted pl-7 pr-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Account Email (MongoDB ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                  Creator Bio & Hook Style
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell sponsor brands about your clipping reach, audience demographics, and format..."
                  className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain placeholder-textMuted/50 focus:border-limeAccent outline-none"
                />
              </div>

              {/* Primary platform */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5">
                  Primary Publishing Platform
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  {[
                    { id: 'x', label: 'X (Twitter)' },
                    { id: 'instagram', label: 'Instagram Reels' },
                    { id: 'youtube_shorts', label: 'YouTube Shorts' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrimaryPlatform(p.id as any)}
                      className={`rounded-xl px-3 py-2 text-xs font-heading font-bold border transition ${primaryPlatform === p.id
                          ? 'bg-limeAccent text-[#0B0F10] border-limeAccent'
                          : 'bg-surfaceElevated border-borderMuted text-textMuted hover:text-textMain'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    X (Twitter) Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://x.com/username"
                    value={xLink}
                    onChange={(e) => setXLink(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    YouTube Channel
                  </label>
                  <input
                    type="text"
                    placeholder="youtube.com/@handle"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                </div>
              </div>

              {/* Payout method */}
              <div className="pt-2 border-t border-borderMuted space-y-3">
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain">
                  Reward Payout Destination
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  {[
                    { id: 'stripe', label: 'Stripe Connect' },
                    { id: 'paypal', label: 'PayPal' },
                    { id: 'crypto', label: 'Solana / ETH' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayoutType(m.id as any)}
                      className={`rounded-xl px-3 py-2 text-xs font-heading font-bold border transition ${payoutType === m.id
                          ? 'bg-surfaceElevated border-limeAccent text-limeAccent'
                          : 'bg-surfaceElevated/50 border-borderMuted text-textMuted hover:text-textMain'
                        }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="max-w-md">
                  <input
                    type="text"
                    placeholder={
                      payoutType === 'stripe'
                        ? 'Stripe account ID (e.g. acct_1Nzk98WhopConnect)'
                        : payoutType === 'paypal'
                          ? 'paypal-recipient@example.com'
                          : 'Solana or Ethereum wallet address'
                    }
                    value={payoutIdentifier}
                    onChange={(e) => setPayoutIdentifier(e.target.value)}
                    className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-3.5 py-2 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                  />
                  <span className="text-[10px] text-textMuted mt-1 block font-mono">
                    Earnings are credited directly to this account upon reaching the view threshold.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-borderMuted">
                <span className="text-[11px] text-textMuted font-mono">
                  Database: MongoDB Cluster0 • Collection: users
                </span>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-limeAccent/20 active:scale-[0.98]"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB CONTENT: JOINED CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-heading font-bold text-textMain">
                  Active Joined Campaigns
                </h3>
                <p className="text-xs text-textMuted">
                  Campaigns where you are registered to create and submit clips.
                </p>
              </div>
              <Link
                href="/campaigns"
                className="text-xs font-heading font-bold text-limeAccent hover:underline flex items-center gap-1"
              >
                <span>Browse All Campaigns</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {joinedCampaignsList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-borderMuted p-12 text-center space-y-3 bg-surface">
                <Layers className="h-8 w-8 text-textMuted mx-auto" />
                <h4 className="text-sm font-heading font-bold text-textMain">
                  No Joined Campaigns Yet
                </h4>
                <p className="text-xs text-textMuted max-w-sm mx-auto">
                  Browse the creator campaigns marketplace to join funded escrow pools and start earning per view.
                </p>
                <Link
                  href="/campaigns"
                  className="inline-flex rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold text-xs px-4 py-2 hover:brightness-110 transition"
                >
                  Explore Campaigns
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedCampaignsList.map((camp) => (
                  <div
                    key={camp.id}
                    className="rounded-2xl border border-borderMuted bg-surface p-5 space-y-4 flex flex-col justify-between hover:border-limeAccent/40 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{camp.brand_logo}</span>
                          <div>
                            <span className="text-[10px] font-mono text-limeAccent uppercase font-bold">
                              {camp.brand_name}
                            </span>
                            <h4 className="text-sm font-heading font-bold text-textMain line-clamp-1">
                              {camp.title}
                            </h4>
                          </div>
                        </div>

                        <span className="rounded-md bg-emeraldAccent/10 text-emeraldAccent border border-emeraldAccent/20 text-[10px] font-mono font-bold px-2 py-0.5 uppercase">
                          Joined
                        </span>
                      </div>

                      <p className="text-xs text-textMuted line-clamp-2 mb-3">
                        {camp.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 bg-surfaceElevated p-2.5 rounded-xl border border-borderMuted text-center font-mono">
                        <div>
                          <span className="text-[10px] text-textMuted block">CPM</span>
                          <span className="text-xs font-bold text-limeAccent">
                            ${camp.cpm_rate.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-textMuted block">Remaining</span>
                          <span className="text-xs font-bold text-textMain">
                            ${camp.remaining_budget.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-textMuted block">Min Views</span>
                          <span className="text-xs font-bold text-textMain">
                            {camp.min_views_threshold.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-borderMuted">
                      <a
                        href={camp.asset_drive_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-textMuted hover:text-textMain flex items-center gap-1 font-mono"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Asset Drive</span>
                      </a>

                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold text-xs px-3.5 py-1.5 flex items-center gap-1 transition"
                      >
                        <span>Submit Clip</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: SUBMITTED CLIPS */}
        {activeTab === 'clips' && (
          <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-base font-heading font-bold text-textMain">
                Submitted Video Clips & Tracking
              </h3>
              <p className="text-xs text-textMuted">
                Live performance data across all short-form videos submitted by your creator account.
              </p>
            </div>

            {userSubmissions.length === 0 ? (
              <div className="py-12 text-center text-textMuted space-y-2">
                <Video className="h-8 w-8 mx-auto text-textMuted/50" />
                <p className="text-xs">No video clips submitted yet.</p>
                <Link
                  href="/campaigns"
                  className="inline-block text-xs text-limeAccent font-heading font-bold hover:underline"
                >
                  Join a campaign and submit a clip →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-borderMuted text-[11px] font-heading font-bold uppercase text-textMuted">
                      <th className="pb-3 px-3">Clip Link</th>
                      <th className="pb-3 px-3">Platform</th>
                      <th className="pb-3 px-3">Campaign</th>
                      <th className="pb-3 px-3 text-right">Views</th>
                      <th className="pb-3 px-3 text-right">Earned</th>
                      <th className="pb-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderMuted text-xs font-mono">
                    {userSubmissions.map((sub) => {
                      const plat = formatPlatform(sub.platform);
                      return (
                        <tr key={sub.id} className="hover:bg-surfaceElevated/50 transition">
                          <td className="py-3 px-3">
                            <a
                              href={sub.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-limeAccent hover:underline flex items-center gap-1 max-w-[200px] truncate"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              <span className="truncate">{sub.video_url}</span>
                            </a>
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded px-2 py-0.5 text-[10px] bg-surfaceElevated border border-borderMuted">
                              {plat.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans font-medium text-textMain max-w-[180px] truncate">
                            {sub.campaign_title}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-textMain">
                            {(sub.current_view_count || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emeraldAccent">
                            ${(sub.earned_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${sub.verification_status === 'active' || sub.verification_status === 'paid'
                                  ? 'bg-emerald-950/60 text-emeraldAccent border border-emerald-500/30'
                                  : 'bg-surfaceElevated text-textMuted border border-borderMuted'
                                }`}
                            >
                              {sub.verification_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* WITHDRAW MODAL */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
}
