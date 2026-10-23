import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName } from '#database';

@Schema({ collection: CollectionName.COUNTERS, timestamps: true })
export class Counter extends BaseEntity {
  @Prop({ required: true, unique: true, index: true })
  name!: string;

  @Prop({ required: true, default: 0 })
  seq!: number;
}

export type CounterDocument = HydratedDocument<Counter>;
export const CounterSchema = SchemaFactory.createForClass(Counter);
