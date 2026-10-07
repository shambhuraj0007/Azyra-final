import mongoose, { Schema, Document, Model } from 'mongoose';
import { SocialPlatform } from '@/lib/types';

export interface ISubmission extends Document {
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
  bot_velocity_score?: number;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    id: { type: String, required: true, unique: true },
    campaign_id: { type: String, required: true },
    campaign_title: { type: String, required: true },
    creator_id: { type: String, required: true },
    creator_name: { type: String, required: true },
    video_url: { type: String, required: true },
    platform: { type: String, required: true },
    video_external_id: { type: String, required: true },
    initial_view_count: { type: Number, default: 0 },
    current_view_count: { type: Number, default: 0 },
    earned_amount: { type: Number, default: 0 },
    verification_status: {
      type: String,
      enum: ['verifying', 'active', 'flagged_bot', 'paid'],
      default: 'active',
    },
    submitted_at: { type: Number, default: () => Date.now() },
    last_polled_at: { type: Number, default: () => Date.now() },
    bot_velocity_score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SubmissionModel: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default SubmissionModel;
