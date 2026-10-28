import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';
import { CouponDiscountType } from '#common/enums';

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.COUPONS,
})
export class Coupon extends BaseEntity {
  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true, index: true })
  code!: string;

  @Prop({ type: String, required: true, trim: true })
  description!: string;

  @Prop({ type: String, enum: CouponDiscountType, required: true })
  discountType!: CouponDiscountType;

  @Prop({ type: Number, required: true, min: 1 })
  discountValue!: number;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  minOrderPaise!: number;

  @Prop({ type: Number, min: 0 })
  maxDiscountPaise?: number;

  @Prop({ type: Number, min: 1 })
  usageLimit?: number;

  @Prop({ type: Number, default: 0, min: 0 })
  usedCount!: number;

  @Prop({ type: Number, default: 1, min: 1 })
  perCustomerLimit!: number;

  @Prop({ type: [String], default: [] })
  usedCustomerIds!: string[];

  @Prop({ type: Date, required: true })
  validFrom!: Date;

  @Prop({ type: Date, required: true })
  validUntil!: Date;

  @Prop({ type: Boolean, default: true, index: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  applicableShopIds!: string[];
}

export type CouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = createSchema(Coupon, { softDelete: false });
CouponSchema.index({ isActive: 1, validUntil: 1 });
