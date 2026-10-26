import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { InvitationStatus, Role } from '#common/enums';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema, type SoftDeletable } from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.USER_INVITATIONS })
export class UserInvitation extends BaseEntity implements SoftDeletable {
  @Prop({ type: String, required: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ type: String, trim: true })
  name?: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, enum: Role, required: true, index: true })
  role!: Role;

  @Prop({ type: String, default: null, index: true })
  shopId!: string | null;

  @Prop({ type: String, required: true, index: true })
  invitedBy!: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  token!: string;

  @Prop({
    type: String,
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
    index: true,
  })
  status!: InvitationStatus;

  @Prop({ type: Date, required: true, index: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  acceptedAt!: Date | null;

  deletedAt!: Date | null;
  deletedBy!: string | null;
}

export type UserInvitationDocument = HydratedDocument<UserInvitation>;
export const UserInvitationSchema = createSchema(UserInvitation, { softDelete: true });
