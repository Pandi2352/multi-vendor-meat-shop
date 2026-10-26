import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Permission, Role } from '#common/enums';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema, type SoftDeletable } from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.ROLE_PERMISSIONS })
export class RolePermissionOverride extends BaseEntity implements SoftDeletable {
  @Prop({ type: String, enum: Role, required: true, unique: true, index: true })
  role!: Role;

  @Prop({ type: [String], enum: Permission, default: [] })
  permissions!: Permission[];

  @Prop({ type: String, required: true })
  updatedBy!: string;

  deletedAt!: Date | null;
  deletedBy!: string | null;
}

export type RolePermissionOverrideDocument = HydratedDocument<RolePermissionOverride>;
export const RolePermissionOverrideSchema = createSchema(RolePermissionOverride, { softDelete: true });
