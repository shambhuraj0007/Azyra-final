import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name?: string;
  image?: string;
  role: 'brand' | 'creator';
  creatorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  publicProfileEnabled: boolean;
  handle?: string | null;
  profile?: {
    displayName?: string;
    niche?: string;
    bio?: string;
    country?: string;
    audienceSize?: number;
    contactEmail?: string;
    links?: { platform: string; url: string }[];
    sampleUrls?: string[];
    proofUrl?: string;
  };
  rejectionReason?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    role: { type: String, enum: ['brand', 'creator'], default: 'brand' },
    creatorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    publicProfileEnabled: { type: Boolean, default: false },
    handle: { type: String, unique: true, sparse: true, default: null },
    profile: {
      displayName: String,
      niche: String,
      bio: String,
      country: String,
      audienceSize: Number,
      contactEmail: String,
      links: [{ platform: String, url: String }],
      sampleUrls: [String],
      proofUrl: String,
    },
    rejectionReason: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
  },
  { timestamps: true, strict: false }
);

UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ handle: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1, creatorStatus: 1 });

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
