'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Campaign, 
  ClipSubmission, 
  UserProfile, 
  CampaignParticipant, 
  UserRole,
  SocialPlatform 
} from './types';
import { 
  INITIAL_CREATOR, 
  INITIAL_BRAND, 
  INITIAL_MARKETPLACE_CAMPAIGNS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_PARTICIPANTS 
} from './campaignStore';
import { parseSocialUrl, calculateClipPayout } from './campaignUtils';
import { triggerConfetti } from './confetti';

interface CampaignContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  campaigns: Campaign[];
  submissions: ClipSubmission[];
  participants: CampaignParticipant[];
  isJoined: (campaignId: string) => boolean;
  joinCampaign: (campaignId: string) => void;
  submitClip: (payload: {
    campaignId: string;
    videoUrl: string;
    initialViews?: number;
  }) => { success: boolean; error?: string; submission?: ClipSubmission };
  simulateViewGrowth: (submissionId: string, additionalViews: number) => void;
  createCampaign: (data: Omit<Campaign, 'id' | 'created_at' | 'participants_count' | 'total_views_tracked' | 'total_paid_out'>) => { success: boolean; error?: string; campaign?: Campaign };
  toggleCampaignStatus: (campaignId: string, newStatus: Campaign['status']) => void;
  withdrawCreatorBalance: (amount?: number) => { success: boolean; payoutAmount: number };
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_CREATOR);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_MARKETPLACE_CAMPAIGNS);
  const [submissions, setSubmissions] = useState<ClipSubmission[]>(INITIAL_SUBMISSIONS);
  const [participants, setParticipants] = useState<CampaignParticipant[]>(INITIAL_PARTICIPANTS);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('whop_current_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedCampaigns = localStorage.getItem('whop_campaigns');
      if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));

      const savedSubmissions = localStorage.getItem('whop_submissions');
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));

      const savedParticipants = localStorage.getItem('whop_participants');
      if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveStorage = (
    u: UserProfile,
    c: Campaign[],
    s: ClipSubmission[],
    p: CampaignParticipant[]
  ) => {
    try {
      localStorage.setItem('whop_current_user', JSON.stringify(u));
      localStorage.setItem('whop_campaigns', JSON.stringify(c));
      localStorage.setItem('whop_submissions', JSON.stringify(s));
      localStorage.setItem('whop_participants', JSON.stringify(p));
    } catch (e) {
      console.error(e);
    }
  };

  const switchRole = (role: UserRole) => {
    const newUser = role === 'creator' ? INITIAL_CREATOR : INITIAL_BRAND;
    setCurrentUser(newUser);
    try {
      localStorage.setItem('whop_current_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
  };

  const isJoined = (campaignId: string) => {
    return participants.some(
      (p) => p.campaign_id === campaignId && p.creator_id === currentUser.id
    );
  };

  const joinCampaign = (campaignId: string) => {
    if (isJoined(campaignId)) return;

    const newParticipant: CampaignParticipant = {
      id: `part-${Date.now()}`,
      campaign_id: campaignId,
      creator_id: currentUser.id,
      joined_at: Date.now(),
      status: 'approved',
    };

    const updatedParticipants = [newParticipant, ...participants];
    const updatedCampaigns = campaigns.map((c) =>
      c.id === campaignId ? { ...c, participants_count: c.participants_count + 1 } : c
    );

    setParticipants(updatedParticipants);
    setCampaigns(updatedCampaigns);
    saveStorage(currentUser, updatedCampaigns, submissions, updatedParticipants);
    triggerConfetti();
  };

  const submitClip = ({
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
      creator_id: currentUser.id,
      creator_name: `${currentUser.name} (${currentUser.handle})`,
      video_url: videoUrl,
      platform: parseRes.platform,
      video_external_id: parseRes.externalId || `ext-${Date.now()}`,
      initial_view_count: initialViews,
      current_view_count: initialViews,
      earned_amount: 0,
      verification_status: 'active',
      submitted_at: Date.now(),
      last_polled_at: Date.now(),
      bot_velocity_score: 5,
    };

    const updatedSubmissions = [newSubmission, ...submissions];
    setSubmissions(updatedSubmissions);
    saveStorage(currentUser, campaigns, updatedSubmissions, participants);
    triggerConfetti();

    return { success: true, submission: newSubmission };
  };

  /**
   * The Scheduled Worker / Automation loop simulator:
   * 1. Increases views
   * 2. Runs CPM formula: (new_views / 1000) * cpm_rate
   * 3. Calculates payout delta
   * 4. Deducts from campaign.remaining_budget
   * 5. Credits creator.wallet_balance
   */
  const simulateViewGrowth = (submissionId: string, additionalViews: number) => {
    const subIndex = submissions.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) return;

    const sub = submissions[subIndex];
    const campaignIndex = campaigns.findIndex((c) => c.id === sub.campaign_id);
    if (campaignIndex === -1) return;

    const camp = campaigns[campaignIndex];

    const newCurrentViews = sub.current_view_count + additionalViews;

    const payoutCalc = calculateClipPayout({
      initialViews: sub.initial_view_count,
      currentViews: newCurrentViews,
      cpmRate: camp.cpm_rate,
      maxPayoutPerClip: camp.max_payout_per_clip,
      minViewsThreshold: camp.min_views_threshold,
      campaignRemainingBudget: camp.remaining_budget,
    });

    const newlyEarned = Math.max(0, payoutCalc.payout - sub.earned_amount);

    // Update submission
    const updatedSub: ClipSubmission = {
      ...sub,
      current_view_count: newCurrentViews,
      earned_amount: payoutCalc.payout,
      verification_status: payoutCalc.isUnlocked ? 'active' : 'verifying',
      last_polled_at: Date.now(),
    };

    // Update campaign budget
    const newRemainingBudget = Math.max(0, camp.remaining_budget - newlyEarned);
    const updatedCamp: Campaign = {
      ...camp,
      remaining_budget: newRemainingBudget,
      total_paid_out: camp.total_paid_out + newlyEarned,
      total_views_tracked: camp.total_views_tracked + additionalViews,
      status: newRemainingBudget <= 0 ? 'budget_exhausted' : camp.status,
    };

    // Update creator wallet
    const updatedUser: UserProfile = {
      ...currentUser,
      wallet_balance: Number((currentUser.wallet_balance + newlyEarned).toFixed(2)),
      total_earned: Number(((currentUser.total_earned || 0) + newlyEarned).toFixed(2)),
      total_views_generated: (currentUser.total_views_generated || 0) + additionalViews,
    };

    const updatedSubmissions = [...submissions];
    updatedSubmissions[subIndex] = updatedSub;

    const updatedCampaigns = [...campaigns];
    updatedCampaigns[campaignIndex] = updatedCamp;

    setCurrentUser(updatedUser);
    setSubmissions(updatedSubmissions);
    setCampaigns(updatedCampaigns);

    saveStorage(updatedUser, updatedCampaigns, updatedSubmissions, participants);

    if (newlyEarned > 0) {
      triggerConfetti();
    }
  };

  /**
   * Brand creates a campaign: funds escrow from balance
   */
  const createCampaign = (
    data: Omit<Campaign, 'id' | 'created_at' | 'participants_count' | 'total_views_tracked' | 'total_paid_out'>
  ) => {
    if (data.total_budget > currentUser.wallet_balance) {
      return {
        success: false,
        error: `Insufficient brand escrow balance. You have $${currentUser.wallet_balance.toLocaleString()} available.`,
      };
    }

    const newCamp: Campaign = {
      ...data,
      id: `camp-${Date.now()}`,
      created_at: Date.now(),
      participants_count: 0,
      total_views_tracked: 0,
      total_paid_out: 0,
      remaining_budget: data.total_budget,
      status: 'active',
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      wallet_balance: currentUser.wallet_balance - data.total_budget,
    };

    const updatedCampaigns = [newCamp, ...campaigns];
    setCurrentUser(updatedUser);
    setCampaigns(updatedCampaigns);
    saveStorage(updatedUser, updatedCampaigns, submissions, participants);
    triggerConfetti();

    return { success: true, campaign: newCamp };
  };

  const toggleCampaignStatus = (campaignId: string, newStatus: Campaign['status']) => {
    const campIndex = campaigns.findIndex((c) => c.id === campaignId);
    if (campIndex === -1) return;

    const camp = campaigns[campIndex];
    let updatedUser = { ...currentUser };

    // If archiving, refund remaining escrow to brand wallet
    if (newStatus === 'archived' && camp.remaining_budget > 0) {
      updatedUser.wallet_balance += camp.remaining_budget;
    }

    const updatedCamp: Campaign = {
      ...camp,
      status: newStatus,
      remaining_budget: newStatus === 'archived' ? 0 : camp.remaining_budget,
    };

    const updatedCampaigns = [...campaigns];
    updatedCampaigns[campIndex] = updatedCamp;

    setCurrentUser(updatedUser);
    setCampaigns(updatedCampaigns);
    saveStorage(updatedUser, updatedCampaigns, submissions, participants);
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
        submitClip,
        simulateViewGrowth,
        createCampaign,
        toggleCampaignStatus,
        withdrawCreatorBalance,
      }}
    >
      {children}
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
