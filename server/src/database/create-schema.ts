import type { Type } from '@nestjs/common';
import { SchemaFactory } from '@nestjs/mongoose';
import type { Schema } from 'mongoose';
import { softDeletePlugin } from './plugins/soft-delete.plugin.js';

export interface CreateSchemaOptions {
  /** Adds deletedAt/deletedBy and hides deleted documents. Do not use on ledgers or movement logs. */
  softDelete?: boolean;
}

/** Use instead of `SchemaFactory.createForClass` so shared plugins are applied consistently. */
export const createSchema = <T>(entity: Type<T>, options: CreateSchemaOptions = {}): Schema<T> => {
  const schema = SchemaFactory.createForClass(entity);
  if (options.softDelete) schema.plugin(softDeletePlugin);
  return schema;
};
