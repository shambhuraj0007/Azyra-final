import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  password?: string; // Hashed password for email/password authentication
  name?: string;
  image?: string;
  role: 'creator' | 'brand';
  isProfileSetup: boolean;
  creatorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  handle?: string;
  profile?: {
    displayName?: string;
    bio?: string;
    niches?: string[];
    audienceTier?: string;
    country?: string;
    contactEmail?: string;
    links?: Array<{
      platform: 'X' | 'Instagram' | 'YouTube' | 'TikTok';
      url: string;
    }>;
    sampleUrls?: string[];
    payoutMethod?: {
      type: 'stripe' | 'paypal' | 'crypto' | 'bank';
      accountIdentifier: string;
      isVerified?: boolean;
      connectedAt?: Date;
      bankDetails?: {
        bankName?: string;
        accountHolderName?: string;
        accountNumber?: string;
        routingNumber?: string;
        accountType?: 'checking' | 'savings';
      };
    };
  };
  brandProfile?: {
    brandName?: string;
    websiteUrl?: string;
    tagline?: string;
    logoUrl?: string;
  };
  wallet_balance?: number;
  total_earned?: number;
  total_views_generated?: number;
  joinedCampaignIds?: string[];
  passwordHash?: string;
  passwordSalt?: string;
  avatar?: string;
  bio?: string;
  primaryPlatform?: string;
  socialLinks?: any;
  payoutMethod?: any;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    name: { type: String },
    image: { type: String },
    role: { type: String, enum: ['brand', 'creator'], default: 'creator' },
    isProfileSetup: { type: Boolean, default: false },
    creatorStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    handle: { type: String, unique: true, sparse: true },
    profile: {
      displayName: String,
      bio: String,
      niches: [String],
      audienceTier: String,
      country: String,
      contactEmail: String,
      links: [
        {
          platform: { type: String, enum: ['X', 'Instagram', 'YouTube', 'TikTok'] },
          url: String,
        },
      ],
      sampleUrls: [String],
      payoutMethod: {
        type: { type: String, enum: ['stripe', 'paypal', 'crypto', 'bank'], default: 'bank' },
        accountIdentifier: String,
        isVerified: { type: Boolean, default: false },
        connectedAt: Date,
        bankDetails: {
          bankName: String,
          accountHolderName: String,
          accountNumber: String,
          routingNumber: String,
          accountType: { type: String, enum: ['checking', 'savings'], default: 'checking' },
        },
      },
    },
    brandProfile: {
      brandName: String,
      websiteUrl: String,
      tagline: String,
      logoUrl: String,
    },
    wallet_balance: { type: Number, default: 0 },
    total_earned: { type: Number, default: 0 },
    total_views_generated: { type: Number, default: 0 },
    joinedCampaignIds: { type: [String], default: [] },
  },
  { timestamps: true, strict: false }
);

UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ handle: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1, creatorStatus: 1 });

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
