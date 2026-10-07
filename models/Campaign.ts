import mongoose, { Schema, Document, Model } from 'mongoose';
import { SocialPlatform } from '@/lib/types';

export interface ICampaign extends Document {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  brand_url: string;
  brand_leaderboard_rank?: number;
  title: string;
  description: string;
  asset_drive_link: string;
  guidelines: {
    allowed_hashtags: string[];
    accounts_to_mention: string[];
    forbidden_audio: string[];
    requirements: string[];
    notes: string;
  };
  total_budget: number;
  remaining_budget: number;
  cpm_rate: number;
  max_payout_per_clip: number;
  min_views_threshold: number;
  platforms: SocialPlatform[];
  category: string;
  status: 'active' | 'paused' | 'budget_exhausted' | 'archived';
  participants_count: number;
  total_views_tracked: number;
  total_paid_out: number;
  created_at: number;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    id: { type: String, required: true, unique: true },
    brand_id: { type: String, required: true },
    brand_name: { type: String, required: true },
    brand_logo: { type: String, default: '⚡' },
    brand_url: { type: String, default: '' },
    brand_leaderboard_rank: { type: Number },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    asset_drive_link: { type: String, required: true },
    guidelines: {
      allowed_hashtags: { type: [String], default: [] },
      accounts_to_mention: { type: [String], default: [] },
      forbidden_audio: { type: [String], default: [] },
      requirements: { type: [String], default: [] },
      notes: { type: String, default: '' },
    },
    total_budget: { type: Number, required: true },
    remaining_budget: { type: Number, required: true },
    cpm_rate: { type: Number, required: true },
    max_payout_per_clip: { type: Number, required: true },
    min_views_threshold: { type: Number, default: 0 },
    platforms: { type: [String], required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'budget_exhausted', 'archived'],
      default: 'active',
    },
    participants_count: { type: Number, default: 0 },
    total_views_tracked: { type: Number, default: 0 },
    total_paid_out: { type: Number, default: 0 },
    created_at: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

const CampaignModel: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default CampaignModel;
