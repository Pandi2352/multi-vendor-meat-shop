import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName } from '#database';
import { OrderStatus, Role } from '#common/enums';

@Schema({ collection: CollectionName.ORDER_EVENTS, timestamps: true })
export class OrderEvent extends BaseEntity {
  @Prop({ type: String, ref: 'Order', required: true, index: true })
  orderId!: string;

  @Prop({ type: String, enum: OrderStatus, required: true })
  fromStatus!: OrderStatus;

  @Prop({ type: String, enum: OrderStatus, required: true })
  toStatus!: OrderStatus;

  @Prop({ type: String, required: true })
  actorId!: string;

  @Prop({ type: String, enum: Role, required: true })
  actorRole!: Role;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type OrderEventDocument = HydratedDocument<OrderEvent>;
export const OrderEventSchema = SchemaFactory.createForClass(OrderEvent);

OrderEventSchema.index({ orderId: 1, createdAt: 1 });
