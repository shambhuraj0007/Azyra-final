import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductClick extends Document {
  productId: string;
  productUrl: string;
  productName: string;
  ip?: string;
  userAgent?: string;
  clickedAt: Date;
}

export interface IProductMetric extends Document {
  productId: string;
  productUrl: string;
  productName: string;
  totalClicks: number;
  lastClickedAt: Date;
}

const ProductClickSchema = new Schema<IProductClick>(
  {
    productId: { type: String, required: true, index: true },
    productUrl: { type: String, required: true },
    productName: { type: String, default: '' },
    ip: { type: String },
    userAgent: { type: String },
    clickedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

const ProductMetricSchema = new Schema<IProductMetric>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    productUrl: { type: String, required: true },
    productName: { type: String, default: '' },
    totalClicks: { type: Number, default: 0 },
    lastClickedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

export const ProductClick: Model<IProductClick> =
  mongoose.models.ProductClick ||
  mongoose.model<IProductClick>('ProductClick', ProductClickSchema);

export const ProductMetric: Model<IProductMetric> =
  mongoose.models.ProductMetric ||
  mongoose.model<IProductMetric>('ProductMetric', ProductMetricSchema);

export default ProductClick;

