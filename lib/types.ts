export interface ProductEntry {
  id: string;
  name: string;
  tagline: string;
  url: string;
  logo: string;
  category: 'AI & ML' | 'DevTools' | 'SaaS' | 'Web3' | 'Design' | 'Productivity' | 'Fintech' | 'Crypto' | 'Gaming' | 'Marketing' | 'E-commerce' | 'Mobile' | 'Others';
  allTimeSpend: number;
  todaySpend: number;
  createdAt: number;
  recentBidDelta?: number;
  rankDelta?: number;
  clicks?: number;
  description: string;
  verified?: boolean;
}

export type BoardType = 'all-time' | 'daily';

export interface BidActivity {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  targetRank: number;
  previousRank?: number;
  timestamp: number;
  isBump: boolean;
}

// ==========================================
// TWO-SIDED CAMPAIGN MARKETPLACE ENTITIES
// ==========================================

export type UserRole = 'brand' | 'creator';
export type SocialPlatform = 'x' | 'instagram' | 'youtube_shorts';

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  handle: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  isLoggedIn?: boolean;
  isProfileSetup?: boolean;
  primaryPlatform?: SocialPlatform;
  socialLinks?: {
    x?: string;
    instagram?: string;
    youtube?: string;
  };
  payoutMethod?: {
    type: 'stripe' | 'paypal' | 'crypto' | 'bank';
    accountIdentifier: string;
    isVerified?: boolean;
    connectedAt?: number;
    bankDetails?: {
      bankName?: string;
      accountHolderName?: string;
      accountNumber?: string;
      routingNumber?: string;
      accountType?: 'checking' | 'savings';
    };
  };
  wallet_balance: number;
  stripe_connect_id?: string;
  total_earned?: number;
  total_views_generated?: number;
  joinedCampaignIds?: string[];
  creatorStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface CampaignGuidelines {
  allowed_hashtags: string[];
  accounts_to_mention: string[];
  forbidden_audio: string[];
  requirements: string[];
  notes: string;
  // Enhanced creator fields for best implementation:
  hooks?: string[];
  key_talking_points?: string[];
  call_to_action?: string;
  dos?: string[];
  donts?: string[];
  media_kit_link?: string;
  example_videos?: string[];
  video_duration?: string;
  target_audience?: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  brand_url: string;
  brand_leaderboard_rank?: number;
  title: string;
  tagline?: string;
  description: string;
  asset_drive_link: string; // Google Drive / S3 / Dropbox raw video clips
  guidelines: CampaignGuidelines;
  total_budget: number;
  remaining_budget: number;
  cpm_rate: number; // e.g. 1.50 = $1.50 per 1,000 views
  max_payout_per_clip: number; // cap e.g. $300
  min_views_threshold: number; // e.g. 3000 views before payout unlocks
  platforms: SocialPlatform[];
  category: 'SaaS' | 'AI & ML' | 'DevTools' | 'Crypto' | 'Web3' | 'E-commerce' | 'Gaming' | 'Productivity' | 'Design' | 'Fintech' | 'Marketing' | 'Mobile' | 'Others';
  status: 'active' | 'paused' | 'budget_exhausted' | 'archived';
  created_at: number;
  participants_count: number;
  total_views_tracked: number;
  total_paid_out: number;
}

export type CreatorCampaign = Campaign;

export interface CampaignParticipant {
  id: string;
  campaign_id: string;
  creator_id: string;
  joined_at: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ClipSubmission {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  creator_name: string;
  video_url: string;
  platform: SocialPlatform;
  video_external_id: string;
  initial_view_count: number;
  current_view_count: number;
  earned_amount: number;
  verification_status: 'verifying' | 'active' | 'flagged_bot' | 'paid';
  submitted_at: number;
  last_polled_at: number;
  bot_velocity_score?: number; // 0-100 score, >80 = flagged
}
