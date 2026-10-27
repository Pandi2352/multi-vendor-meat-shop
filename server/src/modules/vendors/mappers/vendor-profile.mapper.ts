import type { VendorProfile } from '../schemas/vendor-profile.schema.js';
import type { Shop } from '../../shops/schemas/shop.schema.js';
import type { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';

export const toVendorProfileResponseDto = (
  profile: VendorProfile,
  shop?: Shop | null,
): VendorProfileResponseDto => ({
  id: profile._id,
  userId: profile.userId,
  businessName: profile.businessName,
  ownerName: profile.ownerName,
  fssaiNumber: profile.fssaiNumber,
  fssaiDocumentUrl: profile.fssaiDocumentUrl,
  municipalPermitNumber: profile.municipalPermitNumber,
  municipalPermitUrl: profile.municipalPermitUrl,
  allowedCategories: profile.allowedCategories || [],
  panNumber: profile.panNumber,
  gstin: profile.gstin,
  status: profile.status,
  rejectionReason: profile.rejectionReason,
  verificationNotes: profile.verificationNotes,
  verifiedAt: profile.verifiedAt?.toISOString(),
  createdAt:
    profile.createdAt instanceof Date ? profile.createdAt.toISOString() : String(profile.createdAt),
  updatedAt:
    profile.updatedAt instanceof Date ? profile.updatedAt.toISOString() : String(profile.updatedAt),
  shop: shop
    ? {
        id: shop._id,
        name: shop.name,
        phone: shop.phone,
        status: shop.status,
        line1: shop.address.line1,
        locality: shop.address.locality,
        city: shop.address.city,
        district: shop.address.district,
        pincode: shop.address.pincode,
        openingTime: shop.openingTime,
        closingTime: shop.closingTime,
        serviceRadiusKm: shop.serviceRadiusKm,
      }
    : undefined,
});
