import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';
import { LedgerDirection, LedgerEntryType } from '#common/enums';

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.LEDGER_ENTRIES,
})
export class LedgerEntry extends BaseEntity {
  @Prop({ type: String, required: true, index: true, ref: 'Shop' })
  shopId!: string;

  @Prop({ type: String, required: true, enum: LedgerDirection, index: true })
  direction!: LedgerDirection;

  @Prop({ type: String, required: true, enum: LedgerEntryType, index: true })
  entryType!: LedgerEntryType;

  @Prop({ type: Number, required: true, min: 0 })
  amountPaise!: number;

  @Prop({ type: String, required: true, enum: ['ORDER', 'SETTLEMENT', 'ADJUSTMENT'] })
  referenceType!: string;

  @Prop({ type: String, required: true, index: true })
  referenceId!: string;

  @Prop({ type: String, required: true, trim: true })
  description!: string;

  @Prop({ type: Number, required: true })
  balanceAfterPaise!: number;
}

export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;
export const LedgerEntrySchema = createSchema(LedgerEntry, { softDelete: false });
LedgerEntrySchema.index({ shopId: 1, createdAt: -1 });
