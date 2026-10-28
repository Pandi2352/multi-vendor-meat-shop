import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName } from '#database';
import { CutType, OrderStatus, PaymentMethod, PaymentStatus, PreparationOption } from '#common/enums';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: String, ref: 'Product', required: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 50 })
  grams!: number;

  @Prop({ required: true, min: 1, default: 1 })
  quantity!: number;

  @Prop({ type: String, enum: CutType })
  cutType?: CutType;

  @Prop({ type: String, enum: PreparationOption })
  preparation?: PreparationOption;

  @Prop({ required: true, min: 0 })
  pricePerKgPaise!: number;

  @Prop({ required: true, min: 0 })
  lineTotalPaise!: number;

  @Prop({ min: 50 })
  actualPackedGrams?: number;

  @Prop({ trim: true })
  notes?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class OrderAddressLocation {
  @Prop({ required: true })
  lat!: number;

  @Prop({ required: true })
  lng!: number;
}

export const OrderAddressLocationSchema = SchemaFactory.createForClass(OrderAddressLocation);

@Schema({ _id: false })
export class OrderAddress {
  @Prop({ required: true, trim: true })
  text!: string;

  @Prop({ required: true, trim: true })
  pincode!: string;

  @Prop({ required: true, trim: true })
  district!: string;

  @Prop({ type: OrderAddressLocationSchema, required: true })
  location!: OrderAddressLocation;

  @Prop({ trim: true })
  label?: string;
}

export const OrderAddressSchema = SchemaFactory.createForClass(OrderAddress);

@Schema({ _id: false })
export class OrderTotals {
  @Prop({ required: true, min: 0 })
  subtotalPaise!: number;

  @Prop({ required: true, min: 0, default: 0 })
  deliveryFeePaise!: number;

  @Prop({ required: true, min: 0, default: 0 })
  packagingFeePaise!: number;

  @Prop({ required: true, min: 0, default: 0 })
  discountPaise!: number;

  @Prop({ required: true, min: 0 })
  totalPaise!: number;

  @Prop({ required: true, min: 50 })
  totalWeightGrams!: number;
}

export const OrderTotalsSchema = SchemaFactory.createForClass(OrderTotals);

@Schema({ _id: false })
export class OrderPayment {
  @Prop({ type: String, enum: PaymentMethod, required: true, default: PaymentMethod.COD })
  method!: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, required: true, default: PaymentStatus.COD_PENDING })
  status!: PaymentStatus;

  @Prop({ trim: true })
  providerRef?: string;

  @Prop({ type: Date })
  paidAt?: Date;
}

export const OrderPaymentSchema = SchemaFactory.createForClass(OrderPayment);

@Schema({ _id: false })
export class OrderSlot {
  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;
}

export const OrderSlotSchema = SchemaFactory.createForClass(OrderSlot);

@Schema({ collection: CollectionName.ORDERS, timestamps: true })
export class Order extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  orderNumber!: string;

  @Prop({ type: String, ref: 'User', required: true, index: true })
  customerId!: string;

  @Prop({ type: String, ref: 'Shop', required: true, index: true })
  shopId!: string;

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items!: OrderItem[];

  @Prop({ type: OrderTotalsSchema, required: true })
  totals!: OrderTotals;

  @Prop({ type: OrderAddressSchema, required: true })
  deliveryAddress!: OrderAddress;

  @Prop({ trim: true })
  customerNotes?: string;

  @Prop({ type: String, enum: OrderStatus, required: true, default: OrderStatus.PLACED, index: true })
  status!: OrderStatus;

  @Prop({ type: OrderPaymentSchema, required: true, default: () => ({}) })
  payment!: OrderPayment;

  @Prop({ type: OrderSlotSchema })
  slot?: OrderSlot;

  @Prop({ trim: true })
  cancelReason?: string;

  @Prop({ trim: true })
  rejectReason?: string;

  @Prop({ trim: true, uppercase: true })
  couponCode?: string;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ shopId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });
