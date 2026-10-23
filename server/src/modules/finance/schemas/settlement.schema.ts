import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';
import { SettlementStatus } from '#common/enums';

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.SETTLEMENTS,
})
export class Settlement extends BaseEntity {
  @Prop({ type: String, required: true, unique: true, index: true })
  settlementNumber!: string;

  @Prop({ type: String, required: true, index: true, ref: 'Shop' })
  shopId!: string;

  @Prop({ type: Date, required: true })
  periodStart!: Date;

  @Prop({ type: Date, required: true })
  periodEnd!: Date;

  @Prop({ type: Number, required: true, min: 0 })
  orderCount!: number;

  @Prop({ type: Number, required: true, min: 0 })
  grossSalesPaise!: number;

  @Prop({ type: Number, required: true, min: 0 })
  commissionDeductedPaise!: number;

  @Prop({ type: Number, required: true, min: 0 })
  netPayoutPaise!: number;

  @Prop({
    type: String,
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
    index: true,
  })
  status!: SettlementStatus;

  @Prop({ type: String, trim: true })
  utrNumber?: string;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: Date })
  settledAt?: Date;
}

export type SettlementDocument = HydratedDocument<Settlement>;
export const SettlementSchema = createSchema(Settlement, { softDelete: false });
SettlementSchema.index({ shopId: 1, createdAt: -1 });
