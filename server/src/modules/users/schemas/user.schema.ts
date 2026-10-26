import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Role, UserStatus } from '#common/enums';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema, type SoftDeletable } from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.USERS })
export class User extends BaseEntity implements SoftDeletable {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ type: String, trim: true })
  name?: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, enum: Role, default: Role.CUSTOMER, index: true })
  role!: Role;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE, index: true })
  status!: UserStatus;

  @Prop({ type: String, default: null, index: true })
  shopId!: string | null;

  @Prop({ type: String, trim: true, default: null })
  dutyTitle?: string | null;

  @Prop({ type: String, default: null })
  passwordHash?: string | null;

  deletedAt!: Date | null;
  deletedBy!: string | null;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = createSchema(User, { softDelete: true });
