import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity } from '#database';

@Schema({ collection: 'inventory_batches', timestamps: true })
export class InventoryBatch extends BaseEntity {
  @Prop({ type: String, ref: 'Shop', required: true, index: true })
  shopId!: string;

  @Prop({ type: String, ref: 'Product', required: true, index: true })
  productId!: string;

  @Prop({ required: true, index: true })
  batchDate!: string; // YYYY-MM-DD in IST

  @Prop({ required: true, min: 0 })
  availableGrams!: number; // Integer grams currently available to purchase

  @Prop({ required: true, min: 0, default: 0 })
  reservedGrams!: number; // Integer grams temporarily on hold in active carts/unpaid orders

  @Prop({ required: true, min: 0 })
  totalOpeningGrams!: number; // Integer grams recorded at batch start

  @Prop({ required: true, index: true })
  expiresAt!: Date; // Expiry timestamp (end of day IST)
}

export type InventoryBatchDocument = HydratedDocument<InventoryBatch>;
export const InventoryBatchSchema = SchemaFactory.createForClass(InventoryBatch);

InventoryBatchSchema.index({ shopId: 1, productId: 1, batchDate: 1 }, { unique: true });
InventoryBatchSchema.index({ shopId: 1, batchDate: 1 });
