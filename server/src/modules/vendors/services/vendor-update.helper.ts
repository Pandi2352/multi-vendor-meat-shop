import type { UserRepository } from '#modules/users';
import type { ShopRepository } from '../../shops/repositories/shop.repository.js';
import type { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import type { AdminUpdateVendorDto } from '../dto/admin-update-vendor.dto.js';
import type { VendorProfile } from '../schemas/vendor-profile.schema.js';
import type { Shop } from '../../shops/schemas/shop.schema.js';

interface UpdateContext {
  userRepo: UserRepository;
  vendorRepo: VendorProfileRepository;
  shopRepo: ShopRepository;
}

/** Executes administrative update of vendor profile and stall premises. */
export async function executeAdminUpdateVendor(
  ctx: UpdateContext,
  vendorId: string,
  dto: AdminUpdateVendorDto,
): Promise<{ profile: VendorProfile; shop: Shop | null }> {
  const profile = await ctx.vendorRepo.findByIdOrThrow(vendorId);

  const profileUpdates: Record<string, unknown> = {};
  if (dto.shopName) profileUpdates.businessName = dto.shopName;
  if (dto.ownerName) profileUpdates.ownerName = dto.ownerName;
  if (dto.fssaiNumber) profileUpdates.fssaiNumber = dto.fssaiNumber;
  if (dto.fssaiDocumentUrl !== undefined) profileUpdates.fssaiDocumentUrl = dto.fssaiDocumentUrl;
  if (dto.municipalPermitNumber !== undefined) {
    profileUpdates.municipalPermitNumber = dto.municipalPermitNumber;
  }

  if (Object.keys(profileUpdates).length > 0) {
    await ctx.vendorRepo.updateByIdOrThrow(profile._id, profileUpdates);
  }

  if (dto.ownerName || dto.phone) {
    await ctx.userRepo.updateById(profile.userId, {
      ...(dto.ownerName ? { name: dto.ownerName } : {}),
      ...(dto.phone ? { phone: dto.phone } : {}),
    });
  }

  const existingShop = await ctx.shopRepo.findByVendorId(profile._id);
  if (existingShop) {
    const shopUpdates: Record<string, unknown> = {};
    if (dto.shopName) shopUpdates.name = dto.shopName;
    if (dto.shopNameTa !== undefined) shopUpdates.nameTa = dto.shopNameTa;
    if (dto.phone) shopUpdates.phone = dto.phone;
    if (dto.line1) shopUpdates.line1 = dto.line1;
    if (dto.locality) shopUpdates.locality = dto.locality;
    if (dto.city) shopUpdates.city = dto.city;
    if (dto.pincode) shopUpdates.pincode = dto.pincode;
    if (dto.openingTime) shopUpdates.openingTime = dto.openingTime;
    if (dto.closingTime) shopUpdates.closingTime = dto.closingTime;
    if (dto.serviceRadiusKm !== undefined) shopUpdates.serviceRadiusKm = dto.serviceRadiusKm;

    if (Object.keys(shopUpdates).length > 0) {
      await ctx.shopRepo.updateById(existingShop._id, shopUpdates);
    }
  }

  const updatedProfile = await ctx.vendorRepo.findByIdOrThrow(vendorId);
  const updatedShop = await ctx.shopRepo.findByVendorId(profile._id);

  return { profile: updatedProfile, shop: updatedShop };
}
