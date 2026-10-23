import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity } from '#database';

@Schema({ collection: 'categories', timestamps: true })
export class Category extends BaseEntity {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  imageUrl?: string;

  @Prop({ type: String, ref: 'Category', default: null, index: true })
  parentId!: string | null;

  @Prop({ default: 0, index: true })
  order!: number;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ parentId: 1, order: 1 });
CategorySchema.index({ isActive: 1, order: 1 });
