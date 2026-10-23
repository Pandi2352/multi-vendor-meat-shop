import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';
import { DeliveryStatus } from '#common/enums';
import { OrderDeliveryAddressDto } from '#modules/orders';

@Schema({ _id: false })
export class DeliveryAddressEmbed {
  @Prop({ required: true, trim: true })
  text!: string;

  @Prop({ required: true, trim: true })
  pincode!: string;

  @Prop({ required: true, trim: true })
  district!: string;

  @Prop({ type: String, trim: true })
  label?: string;
}

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.DELIVERY_TASKS,
})
export class DeliveryTask extends BaseEntity {
  @Prop({ type: String, required: true, index: true, ref: 'Order' })
  orderId!: string;

  @Prop({ required: true, index: true })
  orderNumber!: string;

  @Prop({ type: String, required: true, index: true, ref: 'Shop' })
  shopId!: string;

  @Prop({ required: true })
  shopName!: string;

  @Prop({ type: String, required: true, index: true, ref: 'User' })
  customerId!: string;

  @Prop({ type: String, index: true, ref: 'User' })
  partnerId?: string;

  @Prop({ type: String })
  partnerName?: string;

  @Prop({ type: String })
  partnerPhone?: string;

  @Prop({
    type: String,
    enum: DeliveryStatus,
    default: DeliveryStatus.UNASSIGNED,
    index: true,
  })
  status!: DeliveryStatus;

  @Prop({ type: DeliveryAddressEmbed, required: true })
  pickupAddress!: DeliveryAddressEmbed;

  @Prop({ type: DeliveryAddressEmbed, required: true })
  deliveryAddress!: DeliveryAddressEmbed;

  @Prop({ type: Number, required: true, min: 0 })
  codAmountPaise!: number;

  @Prop({ type: Boolean, default: false })
  codCollected!: boolean;

  @Prop({ required: true })
  otpHash!: string;

  @Prop({ type: String })
  otpPlain?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  failureReason?: string;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop({ type: Date })
  pickedUpAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;
}

export type DeliveryTaskDocument = HydratedDocument<DeliveryTask>;
export const DeliveryTaskSchema = createSchema(DeliveryTask);

DeliveryTaskSchema.index({ partnerId: 1, status: 1 });
DeliveryTaskSchema.index({ shopId: 1, status: 1 });
DeliveryTaskSchema.index({ status: 1, createdAt: -1 });
