import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, baseSchemaOptions, CollectionName, createSchema } from '#database';

@Schema({ _id: false })
export class AddressCoordinates {
  @Prop({ type: Number, required: true })
  lat!: number;

  @Prop({ type: Number, required: true })
  lng!: number;
}

@Schema({
  ...baseSchemaOptions,
  collection: CollectionName.ADDRESSES,
})
export class Address extends BaseEntity {
  @Prop({ type: String, required: true, index: true, ref: 'User' })
  userId!: string;

  @Prop({ type: String, required: true, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' })
  label!: string;

  @Prop({ type: String, required: true, trim: true })
  text!: string;

  @Prop({ type: String, required: true, trim: true })
  pincode!: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  district!: string;

  @Prop({ type: Boolean, default: false })
  isDefault!: boolean;

  @Prop({ type: AddressCoordinates })
  location?: AddressCoordinates;
}

export type AddressDocument = HydratedDocument<Address>;
export const AddressSchema = createSchema(Address, { softDelete: false });
AddressSchema.index({ userId: 1, isDefault: 1 });
