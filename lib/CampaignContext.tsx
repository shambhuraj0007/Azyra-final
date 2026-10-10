'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Campaign,
  ClipSubmission,
  UserProfile,
  CampaignParticipant,
  UserRole,
  SocialPlatform
} from './types';
import {
  GUEST_USER,
  INITIAL_CREATOR,
  INITIAL_BRAND,
  INITIAL_MARKETPLACE_CAMPAIGNS,
  INITIAL_SUBMISSIONS,
  INITIAL_PARTICIPANTS
} from './campaignStore';
import { parseSocialUrl, calculateClipPayout } from './campaignUtils';
import { triggerConfetti } from './confetti';
import CreatorSetupModal from '../components/CreatorSetupModal';

interface CampaignContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  campaigns: Campaign[];
  submissions: ClipSubmission[];
  participants: CampaignParticipant[];
  isJoined: (campaignId: string) => boolean;
  joinCampaign: (campaignId: string) => {
    success: boolean;
    reason?: 'AUTH_REQUIRED' | 'SETUP_REQUIRED';
    message?: string
  };
  isSetupModalOpen: boolean;
  pendingCampaignId: string | null;
  openSetupModal: (campaignIdToJoinAfterSetup?: string) => void;
  closeSetupModal: () => void;
  login: (email: string, name?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  logout: () => void;
  saveProfile: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  submitClip: (payload: {
    campaignId: string;
    videoUrl: string;
    initialViews?: number;
  }) => Promise<{ success: boolean; error?: string; submission?: ClipSubmission }>;
  simulateViewGrowth: (submissionId: string, additionalViews: number) => Promise<void>;
  createCampaign: (data: Omit<Campaign, 'id' | 'created_at' | 'participants_count' | 'total_views_tracked' | 'total_paid_out'>) => Promise<{ success: boolean; error?: string; campaign?: Campaign }>;
  toggleCampaignStatus: (campaignId: string, newStatus: Campaign['status']) => void;
  withdrawCreatorBalance: (amount?: number) => { success: boolean; payoutAmount: number };
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_MARKETPLACE_CAMPAIGNS);
  const [submissions, setSubmissions] = useState<ClipSubmission[]>(INITIAL_SUBMISSIONS);
  const [participants, setParticipants] = useState<CampaignParticipant[]>([]);

  // Setup modal state
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);

  const lastFetchedEmailRef = useRef<string | null>(null);

  // 1. Load marketplace data once on client mount
  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        }
      })
      .catch((e) => console.warn('Could not fetch campaigns from MongoDB:', e));

    fetch('/api/submissions')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
          setSubmissions(data.submissions);
        }
      })
      .catch((e) => console.warn('Could not fetch submissions from MongoDB:', e));

    fetch('/api/participants')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.participants)) {
          setParticipants(data.participants);
        }
      })
      .catch((e) => console.warn('Could not fetch participants from MongoDB:', e));
  }, []);

  // 2. Hydrate user session from MongoDB when user logs in or email changes
  useEffect(() => {
    const userEmail = session?.user?.email;

    if (userEmail) {
      // Prevent duplicate fetches if already hydrated for this email
      if (lastFetchedEmailRef.current === userEmail) {
        return;
      }
      lastFetchedEmailRef.current = userEmail;

      fetch(`/api/user?email=${encodeURIComponent(userEmail)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && data?.user) {
            const dbUser = data.user;
            const payout = dbUser.profile?.payoutMethod || dbUser.payoutMethod || null;
            const normalizedHandle = dbUser.handle
              ? (dbUser.handle.startsWith('@') ? dbUser.handle : `@${dbUser.handle}`)
              : '';

            const merged: UserProfile = {
              id: dbUser._id || session.user.id,
              email: dbUser.email,
              name: dbUser.profile?.displayName || dbUser.name || session.user.name || '',
              handle: normalizedHandle,
              avatar: dbUser.image || session.user.image || '🎬',
              bio: dbUser.profile?.bio || dbUser.bio || '',
              role: dbUser.role || 'brand',
              creatorStatus: dbUser.creatorStatus || 'none',
              isLoggedIn: true,
              isProfileSetup: dbUser.creatorStatus === 'approved',
              primaryPlatform: (dbUser.profile?.links?.[0]?.platform?.toLowerCase() === 'youtube'
                ? 'youtube_shorts'
                : dbUser.profile?.links?.[0]?.platform?.toLowerCase() as any) || dbUser.primaryPlatform || 'x',
              socialLinks: {
                x: dbUser.profile?.links?.find((l: any) => l.platform === 'X')?.url || dbUser.socialLinks?.x || '',
                instagram: dbUser.profile?.links?.find((l: any) => l.platform === 'Instagram')?.url || dbUser.socialLinks?.instagram || '',
                youtube: dbUser.profile?.links?.find((l: any) => l.platform === 'YouTube')?.url || dbUser.socialLinks?.youtube || '',
              },
              payoutMethod: payout?.accountIdentifier ? {
                type: payout.type || 'bank',
                accountIdentifier: payout.accountIdentifier,
                isVerified: payout.isVerified ?? false,
                connectedAt: payout.connectedAt ? new Date(payout.connectedAt).getTime() : undefined,
                bankDetails: payout.bankDetails || undefined,
              } : undefined,
              wallet_balance: dbUser.wallet_balance ?? 0,
              total_earned: dbUser.total_earned ?? 0,
              total_views_generated: dbUser.total_views_generated ?? 0,
              joinedCampaignIds: dbUser.joinedCampaignIds || [],
            };
            setCurrentUser(merged);
            localStorage.setItem('whop_current_user', JSON.stringify(merged));
          }
        })
        .catch((e) => console.warn('Could not fetch user details from DB', e));
    } else if (status === "unauthenticated") {
      lastFetchedEmailRef.current = null;
      setCurrentUser(GUEST_USER);
    }
  }, [session?.user?.email, status]);

  const saveStorage = (
    u: UserProfile,
    c?: Campaign[],
    s?: ClipSubmission[],
    p?: CampaignParticipant[]
  ) => {
    try {
      localStorage.setItem('whop_current_user', JSON.stringify(u));
      if (c) localStorage.setItem('whop_campaigns', JSON.stringify(c));
      if (s) localStorage.setItem('whop_submissions', JSON.stringify(s));
      if (p) localStorage.setItem('whop_participants', JSON.stringify(p));
    } catch (e) {
      console.error(e);
    }
  };

  const openSetupModal = (campaignIdToJoinAfterSetup?: string) => {
    // If not logged in, go directly to the dedicated login page!
    if (!currentUser.isLoggedIn && typeof window !== 'undefined') {
      const redirectPath = window.location.pathname;
      const joinParam = campaignIdToJoinAfterSetup ? `&join=${campaignIdToJoinAfterSetup}` : '';
      window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}${joinParam}`;
      return;
    }

    if (campaignIdToJoinAfterSetup) {
      setPendingCampaignId(campaignIdToJoinAfterSetup);
    }
    setIsSetupModalOpen(true);
  };

  const closeSetupModal = () => {
    setIsSetupModalOpen(false);
    setPendingCampaignId(null);
  };

  const login = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const loggedUser: UserProfile = {
        ...GUEST_USER,
        ...data.user,
        id: data.user._id || data.user.id || email,
        email: data.user.email,
        name: data.user.name || name || email.split('@')[0],
        handle: data.user.handle || `@${email.split('@')[0]}`,
        role: data.user.role || 'creator',
        isLoggedIn: true,
        isProfileSetup: Boolean(data.user.isProfileSetup),
      };

      setCurrentUser(loggedUser);
      saveStorage(loggedUser);
      return { success: true, user: loggedUser };
    } catch (err: any) {
      console.error('Login error:', err);
      const fallbackUser: UserProfile = {
        ...GUEST_USER,
        id: email,
        email,
        name: name || email.split('@')[0],
        handle: `@${email.split('@')[0]}`,
        isLoggedIn: true,
        isProfileSetup: false,
      };
      setCurrentUser(fallbackUser);
      saveStorage(fallbackUser);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = async () => {
    setCurrentUser(GUEST_USER);
    try {
      localStorage.removeItem('whop_current_user');
    } catch (e) {
      console.error(e);
    }
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/' });
  };

  const executeJoin = async (campaignId: string, userToJoin: UserProfile = currentUser) => {
    const creatorId = userToJoin.id || userToJoin.email || `creator-${Date.now()}`;
    const newParticipant: CampaignParticipant = {
      id: `part-${Date.now()}`,
      campaign_id: campaignId,
      creator_id: creatorId,
      joined_at: Date.now(),
      status: 'approved',
    };

    const updatedParticipants = [newParticipant, ...participants];
    const updatedCampaigns = campaigns.map((c) =>
      c.id === campaignId ? { ...c, participants_count: (c.participants_count || 0) + 1 } : c
    );

    const updatedJoined = Array.from(new Set([...(userToJoin.joinedCampaignIds || []), campaignId]));
    const updatedUser = { ...userToJoin, joinedCampaignIds: updatedJoined };

    setParticipants(updatedParticipants);
    setCampaigns(updatedCampaigns);
    setCurrentUser(updatedUser);
    saveStorage(updatedUser, updatedCampaigns, submissions, updatedParticipants);
    triggerConfetti();

    // Persist in MongoDB
    try {
      await fetch('/api/campaigns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          creatorId,
          email: updatedUser.email,
        }),
      });
    } catch (e) {
      console.warn('Could not persist joined campaign in DB:', e);
    }
  };

  const saveProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const emailToUse = profileData.email || currentUser.email || 'creator@azyra.io';
      const payload = {
        ...profileData,
        email: emailToUse,
        avatar: profileData.avatar || currentUser.avatar || '🎬',
      };

      const res = await fetch('/api/user/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to save profile' };
      }

      const updatedUser: UserProfile = {
        ...currentUser,
        ...data.user,
        ...profileData,
        id: data.user?._id || data.user?.id || currentUser.id || emailToUse,
        email: emailToUse,
        isLoggedIn: true,
        isProfileSetup: true,
      };

      setCurrentUser(updatedUser);
      saveStorage(updatedUser);
      triggerConfetti();

      // If user was prompted to setup because they were trying to join a campaign, auto-join now!
      if (pendingCampaignId) {
        await executeJoin(pendingCampaignId, updatedUser);
        setPendingCampaignId(null);
      }

      return { success: true, user: updatedUser };
    } catch (err: any) {
      console.error('Error saving profile:', err);
      const fallbackUser: UserProfile = {
        ...currentUser,
        ...profileData,
        isLoggedIn: true,
        isProfileSetup: true,
      };
      setCurrentUser(fallbackUser);
      saveStorage(fallbackUser);

      if (pendingCampaignId) {
        await executeJoin(pendingCampaignId, fallbackUser);
        setPendingCampaignId(null);
      }

      return { success: true, user: fallbackUser };
    }
  };

  const switchRole = (role: UserRole) => {
    const newUser: UserProfile = role === 'creator'
      ? { ...currentUser, role: 'creator' }
      : { ...INITIAL_BRAND, isLoggedIn: true, isProfileSetup: true };
    setCurrentUser(newUser);
    saveStorage(newUser);
  };

  const isJoined = (campaignId: string) => {
    if (!currentUser.isLoggedIn) return false;
    // Check local joined list or participants
    if (currentUser.joinedCampaignIds?.includes(campaignId)) return true;
    return participants.some(
      (p) => p.campaign_id === campaignId && (p.creator_id === currentUser.id || (currentUser.email && p.creator_id === currentUser.email))
    );
  };

  const joinCampaign = (campaignId: string): {
    success: boolean;
    reason?: 'AUTH_REQUIRED' | 'SETUP_REQUIRED';
    message?: string
  } => {
    // 1. Check if user is logged in -> go directly to dedicated login page!
    if (!currentUser.isLoggedIn) {
      if (typeof window !== 'undefined') {
        const redirectPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}&join=${campaignId}`;
      }
      return {
        success: false,
        reason: 'AUTH_REQUIRED',
        message: 'Please sign in or register to join this creator campaign.'
      };
    }

    // 2. Check if user has completed creator profile setup
    if (!currentUser.isProfileSetup) {
      setPendingCampaignId(campaignId);
      setIsSetupModalOpen(true);
      return {
        success: false,
        reason: 'SETUP_REQUIRED',
        message: 'Please complete your creator profile setup to join campaigns.'
      };
    }

    // 3. User is logged in and profile is setup -> proceed
    executeJoin(campaignId, currentUser);
    return { success: true };
  };

  const submitClip = async ({
    campaignId,
    videoUrl,
    initialViews = 0,
  }: {
    campaignId: string;
    videoUrl: string;
    initialViews?: number;
  }) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    if (campaign.status !== 'active') {
      return { success: false, error: `Campaign is currently ${campaign.status}` };
    }

    const parseRes = parseSocialUrl(videoUrl);
    if (!parseRes.isValid || !parseRes.platform) {
      return { success: false, error: parseRes.error || 'Invalid video link' };
    }

    // Check if platform is allowed by campaign
    if (!campaign.platforms.includes(parseRes.platform)) {
      return {
        success: false,
        error: `This campaign only accepts: ${campaign.platforms.join(', ')}`,
      };
    }

    // Check duplicate video link
    const duplicate = submissions.find((s) => s.video_url === videoUrl);
    if (duplicate) {
      return { success: false, error: 'This video clip link has already been submitted.' };
    }

    const newSubmission: ClipSubmission = {
      id: `sub-${Date.now()}`,
      campaign_id: campaignId,
      campaign_title: campaign.title,
      creator_id: currentUser.id || currentUser.email || 'creator',
      creator_name: `${currentUser.name || 'Creator'} (${currentUser.handle || '@creator'})`,
      video_url: videoUrl,
      platform: parseRes.platform,
      video_external_id: parseRes.externalId || `ext-${Date.now()}`,
      submitted_at: Date.now(),
      initial_view_count: initialViews,
      current_view_count: initialViews,
      earned_amount: 0,
      verification_status: 'active',
      last_polled_at: Date.now(),
    };

    const updatedSubmissions = [newSubmission, ...submissions];
    setSubmissions(updatedSubmissions);
    saveStorage(currentUser, campaigns, updatedSubmissions, participants);
    triggerConfetti();

    // Persist to MongoDB
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubmission),
      });
    } catch (e) {
      console.warn('Could not persist submission to MongoDB:', e);
    }

    return { success: true, submission: newSubmission };
  };

  const simulateViewGrowth = async (submissionId: string, additionalViews: number) => {
    const subIndex = submissions.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) return;

    const sub = submissions[subIndex];
    const campaign = campaigns.find((c) => c.id === sub.campaign_id);
    if (!campaign) return;

    const newCurrentViews = sub.current_view_count + additionalViews;

    const { netViews, payout, isUnlocked, isCapped } = calculateClipPayout({
      initialViews: sub.initial_view_count,
      currentViews: newCurrentViews,
      cpmRate: campaign.cpm_rate,
      maxPayoutPerClip: campaign.max_payout_per_clip,
      minViewsThreshold: campaign.min_views_threshold,
      campaignRemainingBudget: campaign.remaining_budget + sub.earned_amount,
    });

    const payoutDelta = payout - sub.earned_amount;

    const updatedSub: ClipSubmission = {
      ...sub,
      current_view_count: newCurrentViews,
      earned_amount: payout,
      verification_status: isCapped || isUnlocked ? 'active' : 'verifying',
      last_polled_at: Date.now(),
    };

    const updatedSubmissions = [...submissions];
    updatedSubmissions[subIndex] = updatedSub;

    // Update campaign budget and metrics
    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === sub.campaign_id) {
        const newRem = Math.max(0, c.remaining_budget - payoutDelta);
        return {
          ...c,
          remaining_budget: newRem,
          total_views_tracked: c.total_views_tracked + additionalViews,
          total_paid_out: c.total_paid_out + payoutDelta,
          status: newRem <= 0 ? ('budget_exhausted' as const) : c.status,
        };
      }
      return c;
    });

    // Update creator wallet balance
    const updatedUser: UserProfile = {
      ...currentUser,
      wallet_balance: Number((currentUser.wallet_balance + payoutDelta).toFixed(2)),
      total_earned: Number(((currentUser.total_earned || 0) + payoutDelta).toFixed(2)),
      total_views_generated: (currentUser.total_views_generated || 0) + additionalViews,
    };

    setSubmissions(updatedSubmissions);
    setCampaigns(updatedCampaigns);
    setCurrentUser(updatedUser);
    saveStorage(updatedUser, updatedCampaigns, updatedSubmissions, participants);

    // Persist to MongoDB
    try {
      await fetch('/api/submissions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          additionalViews,
          payoutDelta,
          newEarnedPayout: payout,
          newCurrentViews,
          status: updatedSub.verification_status,
        }),
      });
    } catch (e) {
      console.warn('Could not persist simulated view growth to MongoDB:', e);
    }
  };

  const createCampaign = async (
    data: Omit<
      Campaign,
      'id' | 'created_at' | 'participants_count' | 'total_views_tracked' | 'total_paid_out'
    >
  ) => {
    if (!currentUser?.isLoggedIn) {
      return {
        success: false,
        error: 'Authentication required: You must sign in or register before creating a campaign.',
      };
    }

    let effectiveUser = currentUser;
    if (effectiveUser.role !== 'brand') {
      effectiveUser = { ...effectiveUser, role: 'brand' };
    }

    if (effectiveUser.wallet_balance < data.total_budget) {
      // In demo/marketplace mode, automatically credit demo brand escrow pool so launch never fails
      effectiveUser = {
        ...effectiveUser,
        wallet_balance: Math.max(effectiveUser.wallet_balance + data.total_budget * 2, 20000),
      };
    }

    const newCamp: Campaign = {
      ...data,
      id: `camp-${Date.now()}`,
      created_at: Date.now(),
      participants_count: 0,
      total_views_tracked: 0,
      total_paid_out: 0,
    };

    const updatedCampaigns = [newCamp, ...campaigns];
    const updatedUser: UserProfile = {
      ...effectiveUser,
      wallet_balance: Math.max(0, effectiveUser.wallet_balance - data.total_budget),
    };

    setCampaigns(updatedCampaigns);
    setCurrentUser(updatedUser);
    saveStorage(updatedUser, updatedCampaigns, submissions, participants);
    triggerConfetti();

    // Persist to MongoDB
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamp),
      });
    } catch (e) {
      console.warn('Could not persist new campaign to MongoDB:', e);
    }

    return { success: true, campaign: newCamp };
  };

  const toggleCampaignStatus = (campaignId: string, newStatus: Campaign['status']) => {
    const updatedCampaigns = campaigns.map((c) =>
      c.id === campaignId ? { ...c, status: newStatus } : c
    );
    setCampaigns(updatedCampaigns);
    saveStorage(currentUser, updatedCampaigns, submissions, participants);
  };

  const withdrawCreatorBalance = (amount?: number) => {
    const payoutAmount = amount || currentUser.wallet_balance;
    if (payoutAmount <= 0) return { success: false, payoutAmount: 0 };

    const updatedUser: UserProfile = {
      ...currentUser,
      wallet_balance: Math.max(0, currentUser.wallet_balance - payoutAmount),
    };

    setCurrentUser(updatedUser);
    saveStorage(updatedUser, campaigns, submissions, participants);
    triggerConfetti();

    return { success: true, payoutAmount };
  };

  return (
    <CampaignContext.Provider
      value={{
        currentUser,
        switchRole,
        campaigns,
        submissions,
        participants,
        isJoined,
        joinCampaign,
        isSetupModalOpen,
        pendingCampaignId,
        openSetupModal,
        closeSetupModal,
        login,
        logout,
        saveProfile,
        submitClip,
        simulateViewGrowth,
        createCampaign,
        toggleCampaignStatus,
        withdrawCreatorBalance,
      }}
    >
      {children}
      <CreatorSetupModal />
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}
