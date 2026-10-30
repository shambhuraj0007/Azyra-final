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
    success_criteria?: string;
    payout_structure?: string;
    hooks?: string[];
  };
  total_budget: number;
  remaining_budget: number;
  execution_type?: 'cpm_pool' | 'flat_bounty' | 'creator_direct';
  payout_metric?: {
    primary_label: string;
    primary_value: string;
    action_type?: string;
    target_quota?: number;
    completed_quota?: number;
  };
  bounty_rate?: number;
  bounty_action?: string;
  actions_remaining?: number;
  flat_rate?: number;
  min_followers?: number;
  deliverable_type?: string;
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
    brand_id: { type: String, default: 'brand_default' },
    brand_name: { type: String, default: 'Partner Brand' },
    brand_logo: { type: String, default: '⚡' },
    brand_url: { type: String, default: '' },
    brand_leaderboard_rank: { type: Number },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    asset_drive_link: { type: String, default: '' },
    execution_type: {
      type: String,
      enum: ['cpm_pool', 'flat_bounty', 'creator_direct'],
      default: 'cpm_pool',
    },
    payout_metric: {
      primary_label: { type: String },
      primary_value: { type: String },
      action_type: { type: String },
      target_quota: { type: Number },
      completed_quota: { type: Number },
    },
    bounty_rate: { type: Number },
    bounty_action: { type: String },
    actions_remaining: { type: Number },
    flat_rate: { type: Number },
    min_followers: { type: Number },
    deliverable_type: { type: String },
    guidelines: {
      allowed_hashtags: { type: [String], default: [] },
      accounts_to_mention: { type: [String], default: [] },
      forbidden_audio: { type: [String], default: [] },
      requirements: { type: [String], default: [] },
      notes: { type: String, default: '' },
      success_criteria: { type: String, default: '' },
      payout_structure: { type: String, default: 'cpm' },
      hooks: { type: [String], default: [] },
    },
    total_budget: { type: Number, required: true },
    remaining_budget: { type: Number, required: true },
    cpm_rate: { type: Number, default: 0 },
    max_payout_per_clip: { type: Number, default: 0 },
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
