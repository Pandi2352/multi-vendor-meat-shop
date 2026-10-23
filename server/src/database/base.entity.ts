import { Prop, type SchemaOptions } from '@nestjs/mongoose';
import { generateId } from '#common/utils';

/** `_id` → `id` when a document is serialised. */
const toPublicJson = (_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> => {
  ret.id = ret._id;
  delete ret._id;
  return ret;
};

/** Spread into every `@Schema()`: `@Schema({ ...baseSchemaOptions, collection: CollectionName.PRODUCTS })`. */
export const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  versionKey: false,
  id: false,
  toJSON: { virtuals: true, transform: toPublicJson },
  toObject: { virtuals: true, transform: toPublicJson },
};

/** Every schema extends this. Ids are UUID v7 strings — never ObjectId. */
export abstract class BaseEntity {
  @Prop({ type: String, default: generateId })
  _id!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

/** Added to schemas created with `createSchema(Class, { softDelete: true })`. */
export interface SoftDeletable {
  deletedAt: Date | null;
  deletedBy: string | null;
}
