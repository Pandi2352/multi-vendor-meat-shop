import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema } from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.OTP_CHALLENGES })
export class OtpChallenge extends BaseEntity {
  @Prop({ type: String, required: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ type: String, required: true })
  otpHash!: string;

  @Prop({ type: Date, required: true, index: { expires: 0 } })
  expiresAt!: Date;

  @Prop({ type: Date, required: true })
  resendAvailableAt!: Date;

  @Prop({ type: Number, default: 0 })
  attempts!: number;

  @Prop({ type: Boolean, default: false })
  verified!: boolean;
}

export type OtpChallengeDocument = HydratedDocument<OtpChallenge>;
export const OtpChallengeSchema = createSchema(OtpChallenge);
