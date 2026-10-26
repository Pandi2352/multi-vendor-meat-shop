import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema } from '#database';
import { DisputeReason, DisputeStatus } from '#common/enums';

@Schema({ ...baseSchemaOptions, collection: CollectionName.SUPPORT_TICKETS })
export class Dispute extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  ticketNumber!: string;

  @Prop({ type: String, ref: 'Order', required: true, index: true })
  orderId!: string;

  @Prop({ required: true, index: true })
  orderNumber!: string;

  @Prop({ type: String, ref: 'Shop', required: true, index: true })
  shopId!: string;

  @Prop({ type: String, ref: 'User', required: true, index: true })
  customerId!: string;

  @Prop({ trim: true })
  customerName?: string;

  @Prop({ trim: true })
  customerPhone?: string;

  @Prop({ type: String, enum: DisputeReason, required: true, index: true })
  reason!: DisputeReason;

  @Prop({ type: String, enum: DisputeStatus, required: true, default: DisputeStatus.OPEN, index: true })
  status!: DisputeStatus;

  @Prop({ required: true, trim: true })
  customerComments!: string;

  @Prop({ type: [String], default: [] })
  evidencePhotoUrls!: string[];

  @Prop({ type: Number, required: true, min: 0 })
  claimedAmountPaise!: number;

  @Prop({ type: Number, min: 0 })
  refundAmountPaise?: number;

  @Prop({ type: Number, min: 0 })
  debitStallPaise?: number;

  @Prop({ trim: true })
  resolutionNotes?: string;

  @Prop({ type: String, ref: 'User' })
  resolvedBy?: string;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export type DisputeDocument = HydratedDocument<Dispute>;
export const DisputeSchema = createSchema(Dispute, { softDelete: true });

DisputeSchema.index({ status: 1, createdAt: -1 });
DisputeSchema.index({ shopId: 1, createdAt: -1 });
DisputeSchema.index({ customerId: 1, createdAt: -1 });
