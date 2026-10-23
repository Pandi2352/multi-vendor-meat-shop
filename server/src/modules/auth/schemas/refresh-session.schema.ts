import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema } from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.REFRESH_SESSIONS })
export class RefreshSession extends BaseEntity {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true })
  tokenHash!: string;

  @Prop({ type: Date, required: true, index: { expires: 0 } })
  expiresAt!: Date;

  @Prop({ type: Boolean, default: false, index: true })
  revoked!: boolean;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  ipAddress?: string;
}

export type RefreshSessionDocument = HydratedDocument<RefreshSession>;
export const RefreshSessionSchema = createSchema(RefreshSession);
