import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity } from '#database';
import { CutType, PreparationOption } from '#common/enums';

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: String, ref: 'Product', required: true })
  productId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 50 })
  grams!: number; // Integer grams per piece/portion

  @Prop({ required: true, min: 1, default: 1 })
  quantity!: number; // Integer quantity of portions

  @Prop({ type: String, enum: CutType })
  cutType?: CutType;

  @Prop({ type: String, enum: PreparationOption })
  preparation?: PreparationOption;

  @Prop({ required: true, min: 0 })
  pricePerKgPaise!: number; // Price per kg snapshot in integer paise

  @Prop({ required: true, min: 0 })
  lineTotalPaise!: number; // Calculated total for this line item in paise

  @Prop({ trim: true })
  notes?: string;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ collection: 'carts', timestamps: true })
export class Cart extends BaseEntity {
  @Prop({ type: String, ref: 'User', required: true, unique: true, index: true })
  customerId!: string;

  @Prop({ type: String, ref: 'Shop', default: null, index: true })
  shopId!: string | null;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
