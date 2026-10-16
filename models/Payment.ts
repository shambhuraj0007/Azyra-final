import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  dodo_payment_id?: string;
  dodo_payout_id?: string;
  order_id: string;
  campaign_id?: string;
  user_id: string;
  type: 'campaign_escrow' | 'creator_payout' | 'rank_outbid';
  amount: number;
  currency: string;
  status: 'PENDING' | 'ACTIVE' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUNDED';
  webhook_verified: boolean;
  webhook_payload?: Record<string, any>;
  last_webhook_timestamp?: number;
  payout_account?: {
    type: 'bank' | 'upi' | 'paypal';
    account_holder: string;
    account_number?: string;
    ifsc?: string;
    upi_id?: string;
  };
  created_at: number;
  updated_at: number;
}

const PaymentSchema = new Schema<IPayment>(
  {
    dodo_payment_id: { type: String, sparse: true },
    dodo_payout_id: { type: String, sparse: true },
    order_id: { type: String, required: true, unique: true },
    campaign_id: { type: String },
    user_id: { type: String, required: true },
    type: { type: String, enum: ['campaign_escrow', 'creator_payout', 'rank_outbid'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    webhook_verified: { type: Boolean, default: false },
    webhook_payload: { type: Schema.Types.Mixed },
    last_webhook_timestamp: { type: Number },
    payout_account: {
      type: { type: String, enum: ['bank', 'upi', 'paypal'] },
      account_holder: String,
      account_number: String,
      ifsc: String,
      upi_id: String,
    },
    created_at: { type: Number, default: () => Date.now() },
    updated_at: { type: Number, default: () => Date.now() },
  },
  { timestamps: false }
);

PaymentSchema.index({ user_id: 1, type: 1 });
PaymentSchema.index({ campaign_id: 1 });
PaymentSchema.index({ status: 1 });

const PaymentModel: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);

export default PaymentModel;
