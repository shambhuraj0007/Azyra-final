'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Lock,
  Wallet,
  Building,
  Check,
  ChevronRight,
  AlertTriangle
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

  // Payout states
  const [payoutType, setPayoutType] = useState<'bank' | 'stripe' | 'paypal' | 'crypto'>(
    currentUser?.payoutMethod?.type || 'bank'
  );
  const [payoutIdentifier, setPayoutIdentifier] = useState(
    currentUser?.payoutMethod?.accountIdentifier || ''
  );
  const [bankName, setBankName] = useState(
    currentUser?.payoutMethod?.bankDetails?.bankName || ''
  );
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser?.payoutMethod?.bankDetails?.accountHolderName || ''
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser?.payoutMethod?.bankDetails?.accountNumber || ''
  );
  const [routingNumber, setRoutingNumber] = useState(
    currentUser?.payoutMethod?.bankDetails?.routingNumber || ''
  );
  const [accountType, setAccountType] = useState<'checking' | 'savings'>(
    currentUser?.payoutMethod?.bankDetails?.accountType || 'checking'
  );
  const [isVerifyingPayout, setIsVerifyingPayout] = useState(false);
  const [isEditingPayout, setIsEditingPayout] = useState(false);
  const [payoutFeedbackMsg, setPayoutFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verified Creator Protection states
  const [isUnlockedForEditing, setIsUnlockedForEditing] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSecondaryLinks, setShowSecondaryLinks] = useState(false);

  // Synchronize state when currentUser updates (e.g. hydrated from MongoDB)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.handle) setHandle(currentUser.handle);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.bio) setBio(currentUser.bio);
      if (currentUser.primaryPlatform) setPrimaryPlatform(currentUser.primaryPlatform);
      if (currentUser.socialLinks?.x) setXLink(currentUser.socialLinks.x);
      if (currentUser.socialLinks?.instagram) setInstagramLink(currentUser.socialLinks.instagram);
      if (currentUser.socialLinks?.youtube) setYoutubeLink(currentUser.socialLinks.youtube);

      // Also map from profile.links if present
      const pLinks = (currentUser as any).profile?.links;
      if (Array.isArray(pLinks)) {
        for (const l of pLinks) {
          const plat = (l.platform || '').toLowerCase();
          if ((plat.includes('x') || plat.includes('twitter')) && !xLink) setXLink(l.url);
          else if (plat.includes('instagram') && !instagramLink) setInstagramLink(l.url);
          else if (plat.includes('youtube') && !youtubeLink) setYoutubeLink(l.url);
        }
      }

      if (currentUser.payoutMethod?.type) setPayoutType(currentUser.payoutMethod.type as any);
      if (currentUser.payoutMethod?.accountIdentifier) {
        setPayoutIdentifier(currentUser.payoutMethod.accountIdentifier);
      }
      if (currentUser.payoutMethod?.bankDetails) {
        if (currentUser.payoutMethod.bankDetails.bankName) setBankName(currentUser.payoutMethod.bankDetails.bankName);
        if (currentUser.payoutMethod.bankDetails.accountHolderName) setAccountHolderName(currentUser.payoutMethod.bankDetails.accountHolderName);
        if (currentUser.payoutMethod.bankDetails.accountNumber) setAccountNumber(currentUser.payoutMethod.bankDetails.accountNumber);
        if (currentUser.payoutMethod.bankDetails.routingNumber) setRoutingNumber(currentUser.payoutMethod.bankDetails.routingNumber);
        if (currentUser.payoutMethod.bankDetails.accountType) setAccountType(currentUser.payoutMethod.bankDetails.accountType);
      }
    }
  }, [currentUser]);

  const isPending = currentUser?.creatorStatus === 'pending';
  const isApproved = currentUser?.creatorStatus === 'approved';
  const isLocked = isPending || (isApproved && !isUnlockedForEditing);

  const hasVerifiedPayout = Boolean(
    currentUser?.payoutMethod?.accountIdentifier && currentUser?.payoutMethod?.isVerified
  );

  // Joined campaigns list
  const joinedCampaignsList = campaigns.filter((c) => isJoined(c.id));

  // User's submissions
  const userSubmissions = submissions.filter((s) => s.creator_id === currentUser.id);

  // Profile save handler
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    if (isApproved && !isUnlockedForEditing) {
      setShowWarningModal(true);
      return;
    }

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
    });

    setIsSaving(false);

    if (res.success) {
      if (isApproved) {
        setIsUnlockedForEditing(false);
        setFeedbackMsg({
          type: 'success',
          text: 'Profile updated. Because you edited your verified profile, your account has been returned to the queue for manual re-verification.',
        });
      } else {
        setFeedbackMsg({
          type: 'success',
          text: 'Creator profile changes saved to MongoDB database successfully.',
        });
      }
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to save changes to database.',
      });
    }
  };

  // Verify and connect payout handler
  const handleVerifyAndConnectPayout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalIdentifier = payoutIdentifier.trim();
    let finalBankDetails = undefined;

    if (payoutType === 'bank') {
      if (!accountNumber.trim()) {
        setPayoutFeedbackMsg({
          type: 'error',
          text: 'Please enter your bank account number.',
        });
        return;
      }
      const bName = bankName.trim() || 'Bank';
      finalIdentifier = `${bName} ••••${accountNumber.trim().slice(-4)}`;
      finalBankDetails = {
        bankName: bName,
        accountHolderName: accountHolderName.trim() || currentUser?.name || 'Account Holder',
        accountNumber: accountNumber.trim(),
        routingNumber: routingNumber.trim(),
        accountType,
      };
    } else {
      if (!payoutIdentifier.trim()) {
        setPayoutFeedbackMsg({
          type: 'error',
          text: 'Please enter a valid account identifier, email, or wallet address.',
        });
        return;
      }
    }

    setIsVerifyingPayout(true);
    setPayoutFeedbackMsg(null);

    // Simulate verification ping
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const res = await saveProfile({
      payoutMethod: {
        type: payoutType,
        accountIdentifier: finalIdentifier,
        isVerified: true,
        connectedAt: Date.now(),
        bankDetails: finalBankDetails,
      },
    });

    setIsVerifyingPayout(false);

    if (res.success) {
      setPayoutFeedbackMsg({
        type: 'success',
        text: `Successfully verified and connected ${payoutType === 'bank' ? 'Direct Bank Account' : payoutType.toUpperCase()}! Connected accounts and instant withdrawals are now unlocked.`,
      });
      setIsEditingPayout(false);
      setTimeout(() => setPayoutFeedbackMsg(null), 5000);
    } else {
      setPayoutFeedbackMsg({
        type: 'error',
        text: res.error || 'Failed to verify payout account.',
      });
    }
  };

  // Disconnect payout handler
  const handleDisconnectPayout = async () => {
    setIsVerifyingPayout(true);
    const res = await saveProfile({
      payoutMethod: {
        type: 'stripe',
        accountIdentifier: '',
        isVerified: false,
      },
    });
    setIsVerifyingPayout(false);
    setPayoutIdentifier('');
    setIsEditingPayout(false);
    setPayoutFeedbackMsg({
      type: 'success',
      text: 'Payout account disconnected successfully.',
    });
    setTimeout(() => setPayoutFeedbackMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-canvas text-textMain flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* PROMPT BANNER: Status based */}
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
            </div>
          </div>
        ) : isPending ? (
          <div className="rounded-2xl bg-amber-950/30 border border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-sm font-heading font-bold text-amber-200 flex items-center gap-2">
                  <span>Creator Application Under Review</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    QUEUE VERIFICATION
                  </span>
                </h4>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                  Your application has been received and is queued for verification. Core profile handles and bio are locked to preserve verification integrity. You can connect your payout destination below in advance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs font-mono text-amber-300 bg-surfaceElevated px-3 py-1.5 rounded-xl border border-borderMuted">
                Est. Review: &lt; 24h
              </span>
            </div>
          </div>
        ) : !currentUser?.isProfileSetup && currentUser?.creatorStatus === 'none' ? (
          <div className="rounded-2xl bg-surfaceElevated border border-limeAccent/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-limeAccent shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-sm font-heading font-bold text-textMain">
                  Creator Application Incomplete
                </h4>
                <p className="text-xs text-textMuted">
                  Submit your creator application with social handles to unlock public campaign pools and escrow payouts.
                </p>
              </div>
            </div>
            <Link
              href="/apply"
              className="rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold text-xs px-4 py-2 hover:brightness-110 transition whitespace-nowrap self-start sm:self-auto shadow-sm shadow-limeAccent/20"
            >
              Complete Application →
            </Link>
          </div>
        ) : null}

        {/* HERO PROFILE HEADER */}
        <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-surfaceElevated border border-borderMuted text-3xl sm:text-4xl shadow-inner overflow-hidden">
                  {currentUser?.avatar?.startsWith('http') ? (
                    <img src={currentUser.avatar} alt="Profile Avatar" className="h-full w-full object-cover" />
                  ) : (
                    currentUser?.avatar || '🎬'
                  )}
                </div>
                {isApproved && (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-limeAccent text-[#0B0F10] ring-4 ring-surface"
                    title="Verified Creator Profile"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
                {isPending && (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black ring-4 ring-surface"
                    title="Verification Pending"
                  >
                    <Clock className="h-3.5 w-3.5" />
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
                  {isPending && (
                    <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30 uppercase">
                      Pending Review
                    </span>
                  )}
                  {isApproved && (
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 uppercase">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-textMuted font-mono">
                  <span>{currentUser?.handle || '@handle'}</span>
                  <span>•</span>
                  <span>{currentUser?.email || 'no-email@azyra.io'}</span>
                </div>
                <p className="text-xs text-textMuted max-w-lg mt-1 line-clamp-2">
                  {currentUser?.bio || 'No bio specified. Introduce yourself to sponsor brands.'}
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
                {hasVerifiedPayout ? (
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="text-[10px] font-heading font-bold text-limeAccent hover:underline flex items-center gap-0.5"
                  >
                    <span>Withdraw</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className="text-[10px] font-heading font-bold text-amber-400 hover:underline"
                    title="Connect payout method to unlock withdraw"
                  >
                    Connect Payout
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
        <div className="flex border-b border-borderMuted gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'details'
              ? 'border-limeAccent text-limeAccent'
              : 'border-transparent text-textMuted hover:text-textMain'
              }`}
          >
            <Settings className="h-4 w-4" />
            <span>Profile & Social Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'wallet'
              ? 'border-limeAccent text-limeAccent'
              : 'border-transparent text-textMuted hover:text-textMain'
              }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payout & Withdrawals</span>
            {hasVerifiedPayout ? (
              <span className="h-2 w-2 rounded-full bg-emeraldAccent animate-pulse" />
            ) : (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                Setup
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'campaigns'
              ? 'border-limeAccent text-limeAccent'
              : 'border-transparent text-textMuted hover:text-textMain'
              }`}
          >
            <Layers className="h-4 w-4" />
            <span>My Joined Campaigns ({joinedCampaignsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-heading font-bold border-b-2 transition whitespace-nowrap ${activeTab === 'clips'
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
                Creator Identity & Social Channels
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                Public handles and publishing reach synced with your MongoDB creator profile.
              </p>
            </div>

            {/* PENDING QUEUE LOCK NOTICE */}
            {isPending && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/25 p-4 sm:p-5 flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-heading font-bold text-amber-200 uppercase tracking-wide">
                    Profile Locked During Queue Verification
                  </h4>
                  <p className="text-[11px] text-amber-300/80 mt-1 leading-relaxed">
                    Your creator application is currently being evaluated by our team. To prevent circumvention during manual review, profile handle, name, bio, and social channels are locked in read-only mode until approved.
                  </p>
                </div>
              </div>
            )}

            {/* VERIFIED CREATOR PROTECTED BANNER */}
            {isApproved && !isUnlockedForEditing && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 shadow-inner">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-heading font-bold text-emerald-200 flex items-center gap-2">
                      <span>Verified Creator Profile Locked</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                        VERIFIED
                      </span>
                    </h4>
                    <p className="text-xs text-emerald-300/80 mt-1 leading-relaxed">
                      Your identity and publishing channels are officially verified. Direct edits are locked to preserve your verification checkmark badge. Editing will require re-verification.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWarningModal(true)}
                  className="rounded-xl border border-emerald-500/40 bg-surfaceElevated hover:bg-emerald-950/40 text-emerald-300 font-heading font-bold text-xs px-4 py-2.5 transition flex items-center gap-2 shrink-0 shadow-sm self-start sm:self-auto active:scale-[0.98]"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlock to Edit Profile</span>
                </button>
              </div>
            )}

            {/* RE-VERIFICATION WARNING MODAL */}
            {showWarningModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-md bg-surface p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                      <AlertTriangle className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-textMain">Re-Verification Warning</h3>
                      <p className="text-xs font-mono text-amber-400">Action Required Before Editing</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-xs text-amber-200/90 leading-relaxed space-y-2 font-sans">
                    <p>
                      You are about to unlock your <strong>Verified Creator Profile</strong> for editing.
                    </p>
                    <p>
                      Saving changes to your name, handle, bio, or social publishing channels will <strong>immediately revoke your Verified checkmark badge</strong> and submit your profile back to the administrator queue (<code className="text-amber-300 font-mono">Pending Review</code>) for manual re-evaluation.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWarningModal(false)}
                      className="w-full sm:w-1/2 py-2.5 rounded-xl border border-borderMuted text-textMuted hover:text-textMain text-xs font-mono transition"
                    >
                      Cancel (Stay Verified)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWarningModal(false);
                        setIsUnlockedForEditing(true);
                      }}
                      className="w-full sm:w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0B0F10] font-heading font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
                    >
                      I Understand, Unlock
                    </button>
                  </div>
                </div>
              </div>
            )}

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

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Display Name * {isLocked && <Lock className="inline h-3 w-3 text-amber-400 ml-1" />}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-xl border border-borderMuted px-3.5 py-2.5 text-xs text-textMain outline-none transition ${isLocked
                      ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed opacity-80'
                      : 'bg-surfaceElevated focus:border-limeAccent'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    Creator Handle * {isLocked && <Lock className="inline h-3 w-3 text-amber-400 ml-1" />}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-textMuted font-mono">@</span>
                    <input
                      type="text"
                      required
                      disabled={isLocked}
                      value={handle.replace('@', '')}
                      onChange={(e) => setHandle(e.target.value)}
                      className={`w-full rounded-xl border border-borderMuted pl-7 pr-3.5 py-2.5 text-xs text-textMain font-mono outline-none transition ${isLocked
                        ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed opacity-80'
                        : 'bg-surfaceElevated focus:border-limeAccent'
                        }`}
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
                    disabled={true}
                    value={email}
                    className="w-full rounded-xl bg-surfaceElevated/50 border border-borderMuted px-3.5 py-2.5 text-xs text-textMuted font-mono cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                  Creator Bio & Hook Style {isLocked && <Lock className="inline h-3 w-3 text-amber-400 ml-1" />}
                </label>
                <textarea
                  rows={2}
                  disabled={isLocked}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell sponsor brands about your clipping reach, audience demographics, and format..."
                  className={`w-full rounded-xl border border-borderMuted px-3.5 py-2 text-xs text-textMain placeholder-textMuted/50 outline-none transition ${isLocked
                    ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed opacity-80'
                    : 'bg-surfaceElevated focus:border-limeAccent'
                    }`}
                />
              </div>

              {/* STREAMLINED PUBLISHING PLATFORM & HANDLE (NEAT UI) */}
              <div className="space-y-4 rounded-2xl bg-surfaceElevated/40 border border-borderMuted p-5">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5 flex items-center justify-between">
                    <span>Primary Publishing Platform {isLocked && <Lock className="inline h-3 w-3 text-amber-400 ml-1" />}</span>
                    <span className="text-[10px] font-mono text-textMuted">choose where you publish clips</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md">
                    {[
                      { id: 'x', label: 'X (Twitter)' },
                      { id: 'instagram', label: 'Instagram Reels' },
                      { id: 'youtube_shorts', label: 'YouTube Shorts' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => setPrimaryPlatform(p.id as any)}
                        className={`rounded-xl px-3 py-2 text-xs font-heading font-bold border transition ${primaryPlatform === p.id
                          ? 'bg-limeAccent text-[#0B0F10] border-limeAccent shadow-sm shadow-limeAccent/20'
                          : 'bg-surfaceElevated border-borderMuted text-textMuted hover:text-textMain'
                          } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Single Clean Primary Handle Input */}
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                    {primaryPlatform === 'x' && 'X (Twitter) Profile Link or @Handle *'}
                    {primaryPlatform === 'instagram' && 'Instagram Reels Profile Link or @Handle *'}
                    {primaryPlatform === 'youtube_shorts' && 'YouTube Shorts Channel Link *'}
                    {isLocked && <Lock className="inline h-3 w-3 text-amber-400 ml-1" />}
                  </label>
                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder={
                      primaryPlatform === 'x'
                        ? 'https://x.com/yourhandle or @username'
                        : primaryPlatform === 'instagram'
                          ? 'https://instagram.com/yourhandle or @username'
                          : 'https://youtube.com/@yourchannel'
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
                    className={`w-full rounded-xl border border-borderMuted px-4 py-2.5 text-xs text-textMain font-mono outline-none transition ${isLocked
                      ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed opacity-80'
                      : 'bg-surfaceElevated focus:border-limeAccent'
                      }`}
                  />
                </div>

                {/* Optional Secondary Handles Accordion */}
                <div className="pt-2 border-t border-borderMuted/60">
                  <button
                    type="button"
                    onClick={() => setShowSecondaryLinks(!showSecondaryLinks)}
                    className="text-xs font-mono text-limeAccent hover:underline flex items-center gap-1.5 transition"
                  >
                    <span>{showSecondaryLinks ? '− Hide' : '+ Connect'} Secondary Platforms (Optional)</span>
                    <span className="text-[10px] text-textMuted font-mono">
                      {([xLink, instagramLink, youtubeLink].filter(Boolean).length > 1
                        ? `(${[xLink, instagramLink, youtubeLink].filter(Boolean).length} connected)`
                        : '')}
                    </span>
                  </button>

                  {showSecondaryLinks && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-borderMuted/40 animate-in fade-in duration-200">
                      {primaryPlatform !== 'x' && (
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-textMuted mb-1 font-bold">
                            X (Twitter) Link
                          </label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="https://x.com/username"
                            value={xLink}
                            onChange={(e) => setXLink(e.target.value)}
                            className={`w-full rounded-xl border border-borderMuted px-3 py-2 text-xs text-textMain font-mono outline-none ${isLocked ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed' : 'bg-surfaceElevated focus:border-limeAccent'
                              }`}
                          />
                        </div>
                      )}

                      {primaryPlatform !== 'instagram' && (
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-textMuted mb-1 font-bold">
                            Instagram Handle / Link
                          </label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="@handle or https://instagram.com/..."
                            value={instagramLink}
                            onChange={(e) => setInstagramLink(e.target.value)}
                            className={`w-full rounded-xl border border-borderMuted px-3 py-2 text-xs text-textMain font-mono outline-none ${isLocked ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed' : 'bg-surfaceElevated focus:border-limeAccent'
                              }`}
                          />
                        </div>
                      )}

                      {primaryPlatform !== 'youtube_shorts' && (
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-textMuted mb-1 font-bold">
                            YouTube Channel
                          </label>
                          <input
                            type="text"
                            disabled={isLocked}
                            placeholder="youtube.com/@handle"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                            className={`w-full rounded-xl border border-borderMuted px-3 py-2 text-xs text-textMain font-mono outline-none ${isLocked ? 'bg-surfaceElevated/50 text-textMuted cursor-not-allowed' : 'bg-surfaceElevated focus:border-limeAccent'
                              }`}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK PAYOUT SHORTCUT */}
              <div className="pt-2 border-t border-borderMuted rounded-xl bg-surfaceElevated/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-surfaceElevated border border-borderMuted flex items-center justify-center text-limeAccent">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-textMain">
                      Payout & Connected Withdrawal Account
                    </h4>
                    <p className="text-[11px] text-textMuted">
                      {hasVerifiedPayout
                        ? `Connected: ${currentUser?.payoutMethod?.type === 'bank' ? 'Direct Bank' : currentUser?.payoutMethod?.type?.toUpperCase()} (${currentUser?.payoutMethod?.accountIdentifier})`
                        : 'No verified payout method connected yet.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('wallet')}
                  className="rounded-xl bg-surfaceElevated hover:border-limeAccent/50 border border-borderMuted text-xs font-heading font-bold px-3.5 py-2 text-limeAccent flex items-center gap-1.5 self-start sm:self-auto transition"
                >
                  <span>{hasVerifiedPayout ? 'Manage Connected Account' : 'Connect Payout Method'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-borderMuted">
                <span className="text-[11px] text-textMuted font-mono">
                  Database: MongoDB Cluster0 • Collection: users
                </span>

                {isPending ? (
                  <button
                    type="button"
                    disabled
                    className="rounded-xl bg-surfaceElevated border border-borderMuted text-textMuted font-heading font-bold px-5 py-2.5 text-xs flex items-center gap-2 cursor-not-allowed opacity-80"
                  >
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>Profile Locked (Review In Progress)</span>
                  </button>
                ) : isApproved && !isUnlockedForEditing ? (
                  <button
                    type="button"
                    onClick={() => setShowWarningModal(true)}
                    className="rounded-xl border border-emerald-500/40 bg-surfaceElevated hover:bg-emerald-950/40 text-emerald-300 font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-2 transition active:scale-[0.98]"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Unlock Profile to Edit</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`rounded-xl font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-2 transition disabled:opacity-50 active:scale-[0.98] ${isApproved
                        ? 'bg-amber-500 hover:bg-amber-400 text-[#0B0F10] shadow-md shadow-amber-500/20'
                        : 'bg-limeAccent hover:brightness-110 text-[#0B0F10] shadow-md shadow-limeAccent/20'
                      }`}
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isSaving
                        ? 'Saving Changes...'
                        : isApproved
                          ? 'Save & Submit for Re-Verification'
                          : 'Save Profile Changes'}
                    </span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB CONTENT: PAYOUT & WITHDRAWALS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* STATUS FEEDBACK MESSAGE */}
            {payoutFeedbackMsg && (
              <div
                className={`rounded-xl p-4 text-xs flex items-center gap-2 border ${payoutFeedbackMsg.type === 'success'
                  ? 'bg-surfaceElevated border-emeraldAccent/40 text-emeraldAccent'
                  : 'bg-red-950/60 border-red-500/40 text-red-200'
                  }`}
              >
                {payoutFeedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emeraldAccent shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{payoutFeedbackMsg.text}</span>
              </div>
            )}

            {/* WITHDRAWAL OVERVIEW & ACTION CARD */}
            <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderMuted">
                <div className="space-y-1">
                  <h3 className="text-base font-heading font-bold text-textMain flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-emeraldAccent" />
                    <span>Creator Earnings & Withdrawal</span>
                  </h3>
                  <p className="text-xs text-textMuted">
                    Escrow payouts from sponsored video clipping campaigns.
                  </p>
                </div>

                {hasVerifiedPayout ? (
                  <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="rounded-xl bg-emeraldAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-2 transition shadow-md shadow-emeraldAccent/20 self-start sm:self-auto active:scale-[0.98]"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Withdraw Funds Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs font-mono text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Verify payout method below to unlock withdrawals</span>
                  </div>
                )}
              </div>

              {/* FINANCIAL STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
                  <span className="text-[11px] font-heading font-bold uppercase text-textMuted block mb-1">
                    Available For Withdrawal
                  </span>
                  <div className="text-2xl font-mono font-bold text-emeraldAccent">
                    ${(currentUser?.wallet_balance || 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-textMuted font-mono mt-1 block">
                    Instant release with 0% platform fee
                  </span>
                </div>

                <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
                  <span className="text-[11px] font-heading font-bold uppercase text-textMuted block mb-1">
                    Lifetime Paid Out
                  </span>
                  <div className="text-2xl font-mono font-bold text-textMain">
                    ${(currentUser?.total_earned || 0).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-textMuted font-mono mt-1 block">
                    Total rewards generated
                  </span>
                </div>

                <div className="rounded-xl bg-surfaceElevated p-4 border border-borderMuted">
                  <span className="text-[11px] font-heading font-bold uppercase text-textMuted block mb-1">
                    Verified Views
                  </span>
                  <div className="text-2xl font-mono font-bold text-limeAccent">
                    {(currentUser?.total_views_generated || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-textMuted font-mono mt-1 block">
                    Across TikTok, Reels, Shorts & X
                  </span>
                </div>
              </div>
            </div>

            {/* CONNECTED ACCOUNTS SECTION (When verified and not in edit mode) */}
            {hasVerifiedPayout && !isEditingPayout ? (
              <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-heading font-bold text-textMain flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emeraldAccent" />
                      <span>Connected Payout Account</span>
                    </h3>
                    <p className="text-xs text-textMuted mt-0.5">
                      Your verified destination for campaign escrow withdrawals.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-950/60 text-emeraldAccent border border-emerald-500/30 text-[10px] font-mono font-bold px-3 py-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emeraldAccent animate-pulse" />
                    <span>Active & Verified</span>
                  </span>
                </div>

                {/* THE CONNECTED ACCOUNT CARD */}
                <div className="rounded-2xl bg-surfaceElevated border border-borderMuted p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-surface border border-borderMuted flex items-center justify-center text-2xl shadow-inner">
                      {currentUser?.payoutMethod?.type === 'bank' ? (
                        <Building className="h-6 w-6 text-emeraldAccent" />
                      ) : currentUser?.payoutMethod?.type === 'stripe' ? (
                        <CreditCard className="h-6 w-6 text-limeAccent" />
                      ) : currentUser?.payoutMethod?.type === 'paypal' ? (
                        <Building className="h-6 w-6 text-blue-400" />
                      ) : (
                        <Wallet className="h-6 w-6 text-purple-400" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-heading font-bold text-textMain">
                          {currentUser?.payoutMethod?.type === 'bank'
                            ? `Direct Bank Account (${currentUser?.payoutMethod?.bankDetails?.bankName || 'ACH / Wire'})`
                            : currentUser?.payoutMethod?.type === 'stripe'
                              ? 'Stripe Connect (Direct Deposit)'
                              : currentUser?.payoutMethod?.type === 'paypal'
                                ? 'PayPal Account'
                                : 'Web3 Crypto Wallet'}
                        </h4>
                        <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-1.5 py-0.2">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-textMuted font-mono">
                        Account: <strong className="text-textMain">{currentUser?.payoutMethod?.accountIdentifier}</strong>
                      </div>
                      {currentUser?.payoutMethod?.type === 'bank' && currentUser?.payoutMethod?.bankDetails && (
                        <div className="text-[11px] text-textMuted font-mono flex items-center gap-2 flex-wrap">
                          <span>Holder: <strong className="text-textMain">{currentUser.payoutMethod.bankDetails.accountHolderName || currentUser.name}</strong></span>
                          {currentUser.payoutMethod.bankDetails.routingNumber && (
                            <>
                              <span>•</span>
                              <span>Routing: <strong className="text-textMain">••••{currentUser.payoutMethod.bankDetails.routingNumber.slice(-4)}</strong></span>
                            </>
                          )}
                          <span>•</span>
                          <span>Type: <strong className="text-textMain capitalize">{currentUser.payoutMethod.bankDetails.accountType || 'checking'}</strong></span>
                        </div>
                      )}
                      <div className="text-[10px] text-textMuted flex items-center gap-2 pt-0.5">
                        <span>Instant Direct Transfers</span>
                        <span>•</span>
                        <span>0% Network Fee</span>
                        <span>•</span>
                        <span className="text-emeraldAccent">Escrow Payouts Ready</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      className="rounded-xl bg-limeAccent text-[#0B0F10] font-heading font-bold text-xs px-4 py-2 hover:brightness-110 transition shadow-sm"
                    >
                      Withdraw Funds
                    </button>
                    <button
                      onClick={() => setIsEditingPayout(true)}
                      className="rounded-xl bg-surface border border-borderMuted text-textMuted hover:text-textMain font-heading font-bold text-xs px-3.5 py-2 transition"
                    >
                      Change Method
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ADD & VERIFY PAYOUT METHOD CARD */
              <div className="rounded-2xl border border-borderMuted bg-surface p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-heading font-bold text-textMain flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-limeAccent" />
                    <span>{hasVerifiedPayout ? 'Update Payout Method' : 'Add Payout Method'}</span>
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Connect and verify your Direct Bank Account, Stripe, PayPal, or Crypto wallet to activate withdrawals.
                  </p>
                </div>

                <form onSubmit={handleVerifyAndConnectPayout} className="space-y-5">
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-2">
                      Select Payout Provider
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        {
                          id: 'bank',
                          title: 'Direct Bank Account',
                          subtitle: 'ACH & Wire direct deposit',
                          icon: Building,
                          badge: 'Recommended',
                        },
                        {
                          id: 'stripe',
                          title: 'Stripe Connect',
                          subtitle: 'Direct debit & Express payout',
                          icon: CreditCard,
                          badge: 'Instant',
                        },
                        {
                          id: 'paypal',
                          title: 'PayPal',
                          subtitle: 'Worldwide email transfer',
                          icon: Building,
                          badge: 'Global',
                        },
                        {
                          id: 'crypto',
                          title: 'Solana / ETH',
                          subtitle: 'USDC direct to wallet',
                          icon: Wallet,
                          badge: 'Web3',
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = payoutType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPayoutType(item.id as any)}
                            className={`rounded-2xl p-4 text-left border transition flex flex-col justify-between gap-3 ${isSelected
                              ? 'bg-surfaceElevated border-limeAccent ring-1 ring-limeAccent'
                              : 'bg-surfaceElevated/50 border-borderMuted hover:border-limeAccent/40'
                              }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div
                                className={`h-8 w-8 rounded-xl flex items-center justify-center ${isSelected
                                  ? 'bg-limeAccent text-[#0B0F10]'
                                  : 'bg-surface border border-borderMuted text-textMuted'
                                  }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isSelected
                                  ? 'bg-limeAccent/20 text-limeAccent border-limeAccent/30'
                                  : 'bg-surface border-borderMuted text-textMuted'
                                  }`}
                              >
                                {item.badge}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-heading font-bold text-textMain">{item.title}</div>
                              <div className="text-[11px] text-textMuted">{item.subtitle}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BANK ACCOUNT SPECIFIC FIELDS */}
                  {payoutType === 'bank' ? (
                    <div className="space-y-4 rounded-xl bg-surfaceElevated/50 border border-borderMuted p-4 sm:p-5">
                      <div className="flex items-center gap-2 pb-2 border-b border-borderMuted text-xs font-heading font-bold text-limeAccent">
                        <Building className="h-4 w-4" />
                        <span>Direct Bank Account Information (ACH / Wire)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chase, Bank of America, Wells Fargo"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full rounded-xl bg-surface border border-borderMuted px-3.5 py-2.5 text-xs text-textMain focus:border-limeAccent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                            Account Holder Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Name as it appears on your bank account"
                            value={accountHolderName}
                            onChange={(e) => setAccountHolderName(e.target.value)}
                            className="w-full rounded-xl bg-surface border border-borderMuted px-3.5 py-2.5 text-xs text-textMain focus:border-limeAccent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 123456789012"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full rounded-xl bg-surface border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1">
                            Routing Number (ABA / SWIFT / IFSC) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 021000021"
                            value={routingNumber}
                            onChange={(e) => setRoutingNumber(e.target.value)}
                            className="w-full rounded-xl bg-surface border border-borderMuted px-3.5 py-2.5 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5">
                          Account Type
                        </label>
                        <div className="flex gap-3">
                          {(['checking', 'savings'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAccountType(type)}
                              className={`rounded-xl px-4 py-2 text-xs font-heading font-bold border capitalize transition ${accountType === type
                                ? 'bg-limeAccent text-[#0B0F10] border-limeAccent'
                                : 'bg-surface border-borderMuted text-textMuted hover:text-textMain'
                                }`}
                            >
                              {type} Account
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-textMuted font-mono pt-1">
                        🔒 Direct bank transfers are encrypted by Bank. Payouts deposit directly to your checking/savings balance.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-heading font-bold uppercase tracking-wider text-textMain mb-1.5">
                        {payoutType === 'stripe'
                          ? 'Stripe Connect Account ID or Bank Email *'
                          : payoutType === 'paypal'
                            ? 'PayPal Email Address *'
                            : 'Solana or Ethereum Wallet Address *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          payoutType === 'stripe'
                            ? 'e.g. acct_1Nzk98WhopConnect or stripe-payouts@example.com'
                            : payoutType === 'paypal'
                              ? 'e.g. your-paypal-id@example.com'
                              : 'e.g. 7xKXtg... or 0x483842184F844783...'
                        }
                        value={payoutIdentifier}
                        onChange={(e) => setPayoutIdentifier(e.target.value)}
                        className="w-full rounded-xl bg-surfaceElevated border border-borderMuted px-4 py-3 text-xs text-textMain font-mono focus:border-limeAccent outline-none"
                      />
                      <p className="text-[11px] text-textMuted mt-1.5 font-mono">
                        {payoutType === 'stripe'
                          ? 'Securely linked via Stripe Express API. Bank direct deposit initiates within seconds of withdrawal.'
                          : payoutType === 'paypal'
                            ? 'Funds are sent directly to your verified PayPal balance.'
                            : 'USDC smart contract automatically executes payout to your verified address.'}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-borderMuted flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {hasVerifiedPayout && (
                        <button
                          type="button"
                          onClick={() => setIsEditingPayout(false)}
                          className="rounded-xl border border-borderMuted bg-surfaceElevated px-4 py-2.5 text-xs font-heading text-textMuted hover:text-textMain transition"
                        >
                          Cancel
                        </button>
                      )}
                      {hasVerifiedPayout && (
                        <button
                          type="button"
                          onClick={handleDisconnectPayout}
                          className="rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-300 px-3.5 py-2.5 text-xs font-heading transition"
                        >
                          Disconnect Account
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingPayout || !payoutIdentifier.trim()}
                      className="rounded-xl bg-limeAccent hover:brightness-110 text-[#0B0F10] font-heading font-bold px-6 py-2.5 text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-limeAccent/20 active:scale-[0.98]"
                    >
                      {isVerifyingPayout ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Verifying Account with Network...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Verify & Connect Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
