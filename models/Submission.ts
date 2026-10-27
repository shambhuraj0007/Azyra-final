import mongoose, { Schema, Document, Model } from 'mongoose';
import { SocialPlatform } from '@/lib/types';

export interface ISubmission extends Document {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  creator_name: string;
  creator_handle?: string;
  video_url: string;
  platform: SocialPlatform;
  video_external_id: string;
  initial_view_count: number;
  current_view_count: number;
  earned_amount: number;
  verification_status: 'pending_review' | 'approved' | 'rejected' | 'verifying' | 'active' | 'flagged_bot' | 'paid';
  submitted_at: number;
  last_polled_at: number;
  bot_velocity_score?: number;
  proof_notes?: string;
  rejection_reason?: string;
  reviewed_at?: number;
  reviewed_by?: string;
  platform_fee?: number;
  net_payout?: number;
  screenshot_url?: string;
  ocr_snippet?: string;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    id: { type: String, required: true, unique: true },
    campaign_id: { type: String, required: true },
    campaign_title: { type: String, required: true },
    creator_id: { type: String, required: true },
    creator_name: { type: String, required: true },
    creator_handle: { type: String },
    video_url: { type: String, required: true },
    platform: { type: String, required: true },
    video_external_id: { type: String, required: true },
    initial_view_count: { type: Number, default: 0 },
    current_view_count: { type: Number, default: 0 },
    earned_amount: { type: Number, default: 0 },
    platform_fee: { type: Number, default: 0 },
    net_payout: { type: Number, default: 0 },
    screenshot_url: { type: String },
    ocr_snippet: { type: String },
    verification_status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected', 'verifying', 'active', 'flagged_bot', 'paid'],
      default: 'pending_review',
    },
    submitted_at: { type: Number, default: () => Date.now() },
    last_polled_at: { type: Number, default: () => Date.now() },
    bot_velocity_score: { type: Number, default: 0 },
    proof_notes: { type: String },
    rejection_reason: { type: String },
    reviewed_at: { type: Number },
    reviewed_by: { type: String },
  },
  { timestamps: true }
);

const SubmissionModel: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default SubmissionModel;
