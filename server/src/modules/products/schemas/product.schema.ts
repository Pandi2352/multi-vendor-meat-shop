import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity } from '#database';
import { CutType, PreparationOption, ProductStatus, SellMode, Unit } from '#common/enums';

@Schema({ collection: 'products', timestamps: true })
export class Product extends BaseEntity {
  @Prop({ type: String, ref: 'Shop', required: true, index: true })
  shopId!: string;

  @Prop({ type: String, ref: 'Category', required: true, index: true })
  categoryId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: String, enum: SellMode, default: SellMode.FIXED_WEIGHT })
  sellMode!: SellMode;

  @Prop({ type: String, enum: Unit, default: Unit.GRAM })
  unit!: Unit;

  @Prop({ type: String, enum: CutType, default: CutType.CURRY_CUT })
  cutType?: CutType;

  @Prop({ type: [String], enum: PreparationOption, default: [PreparationOption.CLEANED] })
  allowedPreparation!: PreparationOption[];

  @Prop({ required: true, min: 0 })
  pricePerKgPaise!: number;

  @Prop({ min: 0 })
  mrpPerKgPaise?: number;

  @Prop({ default: 250, min: 50 })
  minGrams!: number;

  @Prop({ default: 5000, min: 50 })
  maxGrams!: number;

  @Prop({ default: 250, min: 50 })
  stepGrams!: number;

  @Prop({ type: [Number], default: [250, 500, 1000] })
  allowedWeightsGrams!: number[];

  @Prop({ min: 0 })
  piecePricePaise?: number;

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.ACTIVE, index: true })
  status!: ProductStatus;

  @Prop({ default: true })
  isFreshDaily!: boolean;

  @Prop({ default: '0-4°C' })
  storageTemp?: string;

  @Prop({ default: 1, min: 1 })
  shelfLifeDays!: number;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ shopId: 1, status: 1 });
ProductSchema.index({ shopId: 1, categoryId: 1, status: 1 });
ProductSchema.index({ shopId: 1, slug: 1 }, { unique: true });
