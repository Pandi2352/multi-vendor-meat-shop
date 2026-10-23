import { Prop, Schema } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { VendorVerificationStatus } from '#common/enums';
import { BaseEntity, CollectionName, baseSchemaOptions, createSchema, type SoftDeletable } from '#database';

@Schema({ ...baseSchemaOptions, collection: CollectionName.VENDOR_PROFILES })
export class VendorProfile extends BaseEntity implements SoftDeletable {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true, trim: true })
  businessName!: string;

  @Prop({ type: String, required: true, trim: true })
  ownerName!: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  fssaiNumber!: string;

  @Prop({ type: String, trim: true })
  fssaiDocumentUrl?: string;

  @Prop({ type: String, trim: true, uppercase: true })
  panNumber?: string;

  @Prop({ type: String, trim: true, uppercase: true })
  gstin?: string;

  @Prop({
    type: String,
    enum: VendorVerificationStatus,
    default: VendorVerificationStatus.DRAFT,
    index: true,
  })
  status!: VendorVerificationStatus;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: String })
  verifiedBy?: string;

  deletedAt!: Date | null;
  deletedBy!: string | null;
}

export type VendorProfileDocument = HydratedDocument<VendorProfile>;
export const VendorProfileSchema = createSchema(VendorProfile, { softDelete: true });
