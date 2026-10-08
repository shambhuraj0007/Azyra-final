import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const AdminOtpSchema = new Schema<IAdminOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 600 }, // 10 minutes TTL
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AdminOtpSchema.index({ email: 1, otp: 1 });
AdminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminOtpModel: Model<IAdminOtp> =
  (mongoose.models.AdminOtp as Model<IAdminOtp>) ||
  mongoose.model<IAdminOtp>('AdminOtp', AdminOtpSchema);

export default AdminOtpModel;
