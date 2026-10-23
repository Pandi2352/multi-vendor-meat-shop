import type { VendorProfile } from '../schemas/vendor-profile.schema.js';
import type { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';

export const toVendorProfileResponseDto = (
  profile: VendorProfile,
): VendorProfileResponseDto => ({
  id: profile._id,
  userId: profile.userId,
  businessName: profile.businessName,
  ownerName: profile.ownerName,
  fssaiNumber: profile.fssaiNumber,
  fssaiDocumentUrl: profile.fssaiDocumentUrl,
  panNumber: profile.panNumber,
  gstin: profile.gstin,
  status: profile.status,
  rejectionReason: profile.rejectionReason,
  verifiedAt: profile.verifiedAt?.toISOString(),
  createdAt:
    profile.createdAt instanceof Date
      ? profile.createdAt.toISOString()
      : String(profile.createdAt),
  updatedAt:
    profile.updatedAt instanceof Date
      ? profile.updatedAt.toISOString()
      : String(profile.updatedAt),
});
