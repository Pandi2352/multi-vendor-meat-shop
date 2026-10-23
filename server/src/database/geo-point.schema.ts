import { Prop, Schema } from '@nestjs/mongoose';
import { createSchema } from './create-schema.js';

/**
 * Embedded GeoJSON point. Coordinates are [longitude, latitude].
 * Index it in the parent schema: `ShopSchema.index({ location: '2dsphere' })`.
 */
@Schema({ _id: false, versionKey: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: 'Point';

  @Prop({
    type: [Number],
    required: true,
    validate: {
      validator: ([lng, lat]: number[]) => Math.abs(lng) <= 180 && Math.abs(lat) <= 90,
      message: 'coordinates must be [longitude, latitude]',
    },
  })
  coordinates!: [number, number];
}

export const GeoPointSchema = createSchema(GeoPoint);
