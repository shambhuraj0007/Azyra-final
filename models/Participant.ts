import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipant extends Document {
  id: string;
  campaign_id: string;
  creator_id: string;
  joined_at: number;
  status: 'pending' | 'approved' | 'rejected';
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    id: { type: String, required: true, unique: true },
    campaign_id: { type: String, required: true },
    creator_id: { type: String, required: true },
    joined_at: { type: Number, default: () => Date.now() },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

const ParticipantModel: Model<IParticipant> =
  mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default ParticipantModel;
