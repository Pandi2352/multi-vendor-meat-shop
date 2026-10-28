import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import {
  BaseEntity,
  CollectionName,
  baseSchemaOptions,
  createSchema,
  type SoftDeletable,
} from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.REVIEWS })
export class Review extends BaseEntity implements SoftDeletable {
  @Prop({ type: String, required: true, index: true })
  shopId!: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  orderId!: string;

  @Prop({ type: String, required: true, index: true })
  customerId!: string;

  @Prop({ type: String, required: true, trim: true })
  customerName!: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ type: String, trim: true, maxlength: 500 })
  comment?: string;

  @Prop({ type: Boolean, default: true })
  isVerifiedPurchase!: boolean;

  @Prop({ type: Boolean, default: true, index: true })
  isApproved!: boolean;

  deletedAt!: Date | null;
  deletedBy!: string | null;
}

export type ReviewDocument = HydratedDocument<Review>;
export const ReviewSchema = createSchema(Review, { softDelete: true });

ReviewSchema.index({ shopId: 1, isApproved: 1, createdAt: -1 });
ReviewSchema.index({ customerId: 1, createdAt: -1 });
