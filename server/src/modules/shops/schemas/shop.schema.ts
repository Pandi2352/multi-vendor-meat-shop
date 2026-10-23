import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { ShopStatus } from '#common/enums';
import {
  BaseEntity,
  CollectionName,
  GeoPoint,
  GeoPointSchema,
  baseSchemaOptions,
  createSchema,
  type SoftDeletable,
} from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.SHOPS })
export class Shop extends BaseEntity implements SoftDeletable {
  @Prop({ type: String, required: true, index: true })
  vendorId!: string;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String, required: true, trim: true })
  phone!: string;

  @Prop({
    type: {
      line1: { type: String, required: true },
      line2: { type: String },
      locality: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true, index: true },
      pincode: { type: String, required: true, index: true },
    },
    required: true,
    _id: false,
  })
  address!: {
    line1: string;
    line2?: string;
    locality: string;
    city: string;
    district: string;
    pincode: string;
  };

  @Prop({ type: GeoPointSchema, required: true })
  location!: GeoPoint;

  @Prop({ type: String, enum: ShopStatus, default: ShopStatus.CLOSED, index: true })
  status!: ShopStatus;

  @Prop({ type: String, required: true, default: '06:00' })
  openingTime!: string;

  @Prop({ type: String, required: true, default: '21:00' })
  closingTime!: string;

  @Prop({ type: Number, required: true, default: 5 })
  serviceRadiusKm!: number;

  @Prop({ type: Number, required: true, default: 0 })
  minOrderPaise!: number;

  @Prop({ type: Number, required: true, default: 3000 })
  deliveryFeePaise!: number;

  @Prop({ type: Number })
  freeDeliveryAbovePaise?: number;

  @Prop({ type: [String], default: [] })
  images!: string[];

  deletedAt!: Date | null;
  deletedBy!: string | null;
}

export type ShopDocument = HydratedDocument<Shop>;
export const ShopSchema = createSchema(Shop, { softDelete: true });

ShopSchema.index({ location: '2dsphere' });
