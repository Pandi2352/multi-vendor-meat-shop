import { ShopStatus, VendorVerificationStatus } from '#common/enums';
import { UserRepository, type User } from '#modules/users';
import type { Shop } from '../../shops/schemas/shop.schema.js';
import type { VendorProfile } from '../schemas/vendor-profile.schema.js';
import { ShopRepository } from '../../shops/repositories/shop.repository.js';
import { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import type { AdminCreateVendorDto } from '../dto/admin-create-vendor.dto.js';
import type { ApplyVendorDto } from '../dto/apply-vendor.dto.js';
import type { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto.js';
import { createVendorShop, resolveVendorOwnerUser } from './vendor-shop.helper.js';

export interface OnboardedVendor {
  profile: VendorProfile;
  shop: Shop;
  user: User;
}

interface OnboardingContext {
  userRepo: UserRepository;
  vendorRepo: VendorProfileRepository;
  shopRepo: ShopRepository;
}

export async function executeAdminCreateVendor(
  ctx: OnboardingContext,
  adminId: string,
  dto: AdminCreateVendorDto,
): Promise<OnboardedVendor> {
  const { userRepo, vendorRepo, shopRepo } = ctx;
  const user = await resolveVendorOwnerUser(userRepo, {
    email: dto.email,
    phone: dto.phone,
    name: dto.ownerName,
  });

  let profile = await vendorRepo.findByUserId(user._id);
  const defaultCategories = ['broiler-chicken', 'goat-mutton', 'nattu-kozhi'];

  if (!profile) {
    profile = await vendorRepo.create({
      userId: user._id,
      businessName: dto.shopName,
      ownerName: dto.ownerName,
      fssaiNumber: dto.fssaiNumber,
      fssaiDocumentUrl: dto.fssaiDocumentUrl,
      allowedCategories: defaultCategories,
      status: VendorVerificationStatus.APPROVED,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      deletedAt: null,
      deletedBy: null,
    });
  } else {
    profile = await vendorRepo.updateByIdOrThrow(profile._id, {
      status: VendorVerificationStatus.APPROVED,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      businessName: dto.shopName,
      ownerName: dto.ownerName,
      fssaiNumber: dto.fssaiNumber,
      allowedCategories: profile.allowedCategories?.length
        ? profile.allowedCategories
        : defaultCategories,
    });
  }

  let shop = await shopRepo.findByVendorId(profile._id);
  if (!shop) {
    shop = await createVendorShop({
      shopRepo,
      vendorId: profile._id,
      name: dto.shopName,
      phone: dto.phone,
      address: dto.address,
      openingTime: dto.openingTime,
      closingTime: dto.closingTime,
      serviceRadiusKm: dto.serviceRadiusKm,
      status: ShopStatus.OPEN,
    });
  }

  const linkedUser = await userRepo.updateByIdOrThrow(user._id, { shopId: shop._id });
  return { profile, shop, user: linkedUser };
}

export async function executeApplyVendor(
  ctx: OnboardingContext,
  dto: ApplyVendorDto,
): Promise<VendorApplicationResponseDto> {
  const { userRepo, vendorRepo, shopRepo } = ctx;
  const user = await resolveVendorOwnerUser(userRepo, {
    email: dto.email,
    phone: dto.phone,
    name: dto.ownerName,
  });

  let profile = await vendorRepo.findByUserId(user._id);
  if (!profile) {
    profile = await vendorRepo.create({
      userId: user._id,
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      fssaiNumber: dto.fssaiNumber,
      allowedCategories: [],
      status: VendorVerificationStatus.SUBMITTED,
      deletedAt: null,
      deletedBy: null,
    });
  } else if (profile.status === VendorVerificationStatus.DRAFT) {
    profile = await vendorRepo.updateByIdOrThrow(profile._id, {
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      fssaiNumber: dto.fssaiNumber,
      status: VendorVerificationStatus.SUBMITTED,
    });
  }

  let shop = await shopRepo.findByVendorId(profile._id);
  if (!shop) {
    shop = await createVendorShop({
      shopRepo,
      vendorId: profile._id,
      name: dto.businessName,
      phone: dto.phone,
      address: {
        line1: dto.addressLine,
        locality: dto.locality,
        city: dto.town,
        pincode: dto.pincode,
      },
      openingTime: dto.openingTime,
      closingTime: dto.closingTime,
      serviceRadiusKm: 8,
      status: ShopStatus.CLOSED,
    });
  }

  await userRepo.updateById(user._id, { shopId: shop._id });

  return {
    applicationId: profile._id,
    status: profile.status,
    shopId: shop._id,
    message:
      'Vendor application submitted successfully. Verification pending by marketplace admin.',
  };
}
