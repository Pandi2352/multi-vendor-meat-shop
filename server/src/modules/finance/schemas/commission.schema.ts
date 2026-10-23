import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.COMMISSIONS,
})
export class Commission extends BaseEntity {
  @Prop({ type: String, required: true, unique: true, index: true, ref: 'Order' })
  orderId!: string;

  @Prop({ type: String, required: true, index: true })
  orderNumber!: string;

  @Prop({ type: String, required: true, index: true, ref: 'Shop' })
  shopId!: string;

  @Prop({ type: Number, required: true, min: 0 })
  grossAmountPaise!: number;

  @Prop({ type: Number, required: true, min: 0, default: 1000 })
  commissionBps!: number; // 1000 = 10.00%

  @Prop({ type: Number, required: true, min: 0 })
  commissionAmountPaise!: number;

  @Prop({ type: Number, required: true, min: 0 })
  netVendorAmountPaise!: number;

  @Prop({ type: String, required: true, default: 'COD' })
  paymentMethod!: string;

  @Prop({ type: String, required: true, default: 'PENDING', enum: ['PENDING', 'SETTLED'], index: true })
  status!: string;

  @Prop({ type: String, index: true, ref: 'Settlement' })
  settlementId?: string;
}

export type CommissionDocument = HydratedDocument<Commission>;
export const CommissionSchema = createSchema(Commission, { softDelete: false });
CommissionSchema.index({ shopId: 1, status: 1 });
