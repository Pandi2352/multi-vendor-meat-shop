import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity } from '#database';
import { InventoryMovementType } from '#common/enums';

@Schema({ collection: 'inventory_movements', timestamps: true })
export class InventoryMovement extends BaseEntity {
  @Prop({ type: String, ref: 'Shop', required: true, index: true })
  shopId!: string;

  @Prop({ type: String, ref: 'Product', required: true, index: true })
  productId!: string;

  @Prop({ type: String, enum: InventoryMovementType, required: true, index: true })
  type!: InventoryMovementType;

  @Prop({ required: true })
  grams!: number; // Integer delta (positive or negative)

  @Prop({ required: true, min: 0 })
  availableGramsAfter!: number;

  @Prop({ required: true, min: 0 })
  reservedGramsAfter!: number;

  @Prop({ required: true })
  referenceType!: string; // 'OPENING', 'ORDER', 'CART_HOLD', 'WASTAGE', 'ADJUSTMENT'

  @Prop({ type: String, default: null, index: true })
  referenceId!: string | null;

  @Prop({ required: true })
  actorId!: string; // Vendor userId, customerId, or 'SYSTEM'

  @Prop({ trim: true })
  notes?: string;
}

export type InventoryMovementDocument = HydratedDocument<InventoryMovement>;
export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);

InventoryMovementSchema.index({ shopId: 1, productId: 1, createdAt: -1 });
InventoryMovementSchema.index({ shopId: 1, createdAt: -1 });
