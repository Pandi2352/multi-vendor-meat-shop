import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema } from '#database';

const ONE_DAY_SECONDS = 24 * 60 * 60;

/**
 * One pending reset per portal user; a new request replaces the token, so older links stop
 * working. Only the SHA-256 of the emailed token is stored. Expired rows are kept a day so the
 * page can still say "expired" rather than "invalid", then MongoDB removes them.
 */
@Schema({ ...baseSchemaOptions, collection: CollectionName.PASSWORD_RESETS })
export class PasswordReset extends BaseEntity {
  @Prop({ type: String, required: true, ref: 'User', unique: true })
  userId!: string;

  @Prop({ type: String, required: true, unique: true })
  tokenHash!: string;

  @Prop({ type: Date, required: true, index: { expires: ONE_DAY_SECONDS } })
  expiresAt!: Date;

  /** When the last reset email was sent; drives the resend cooldown. */
  @Prop({ type: Date, required: true })
  sentAt!: Date;

  @Prop({ type: Date, default: null })
  usedAt!: Date | null;
}

export type PasswordResetDocument = HydratedDocument<PasswordReset>;
export const PasswordResetSchema = createSchema(PasswordReset);
