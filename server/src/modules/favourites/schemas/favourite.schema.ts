import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.FAVOURITES,
})
export class Favourite extends BaseEntity {
  @Prop({ type: String, required: true, index: true, ref: 'User' })
  customerId!: string;

  @Prop({ type: String, required: true, index: true, ref: 'Product' })
  productId!: string;

  @Prop({ type: String, required: true, index: true, ref: 'Shop' })
  shopId!: string;
}

export type FavouriteDocument = HydratedDocument<Favourite>;
export const FavouriteSchema = createSchema(Favourite, { softDelete: false });
FavouriteSchema.index({ customerId: 1, productId: 1 }, { unique: true });
