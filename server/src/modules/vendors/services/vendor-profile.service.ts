import { Injectable } from '@nestjs/common';
import { Role, ShopStatus, UserStatus, VendorVerificationStatus } from '#common/enums';
import { NotFoundAppException } from '#common/exceptions';
import { slugify } from '#common/utils';
import type { ListQueryDto, PaginatedResult } from '#common/dto';
import { UserRepository } from '#modules/users';
import { ShopRepository } from '../../shops/repositories/shop.repository.js';
import { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import { VENDOR_VERIFICATION_MACHINE } from '../constants/vendor.constants.js';
import { getVirudhunagarCoords } from '../constants/town-coords.constants.js';
import type { CreateVendorProfileDto } from '../dto/create-vendor-profile.dto.js';
import type { UpdateVendorProfileDto } from '../dto/update-vendor-profile.dto.js';
import type { VerifyVendorDto } from '../dto/verify-vendor.dto.js';
import type { AdminCreateVendorDto } from '../dto/admin-create-vendor.dto.js';
import type { ApplyVendorDto } from '../dto/apply-vendor.dto.js';
import type { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';
import type { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto.js';
import { toVendorProfileResponseDto } from '../mappers/vendor-profile.mapper.js';

@Injectable()
export class VendorProfileService {
  constructor(
    private readonly vendorRepo: VendorProfileRepository,
    private readonly userRepo: UserRepository,
    private readonly shopRepo: ShopRepository,
  ) {}

  async getProfileByUserId(userId: string): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByUserId(userId);
    if (!profile) throw new NotFoundAppException('VendorProfile', userId);
    const shop = await this.shopRepo.findByVendorId(profile._id);
    return toVendorProfileResponseDto(profile, shop);
  }

  async createOrUpdate(
    userId: string,
    dto: CreateVendorProfileDto | UpdateVendorProfileDto,
  ): Promise<VendorProfileResponseDto> {
    const existing = await this.vendorRepo.findByUserId(userId);

    if (existing) {
      const updated = await this.vendorRepo.updateByIdOrThrow(existing._id, {
        ...(dto.businessName ? { businessName: dto.businessName } : {}),
        ...(dto.ownerName ? { ownerName: dto.ownerName } : {}),
        ...(dto.fssaiNumber ? { fssaiNumber: dto.fssaiNumber } : {}),
        ...(dto.fssaiDocumentUrl !== undefined ? { fssaiDocumentUrl: dto.fssaiDocumentUrl } : {}),
        ...(dto.panNumber !== undefined ? { panNumber: dto.panNumber } : {}),
        ...(dto.gstin !== undefined ? { gstin: dto.gstin } : {}),
      });
      const shop = await this.shopRepo.findByVendorId(updated._id);
      return toVendorProfileResponseDto(updated, shop);
    }

    const created = await this.vendorRepo.create({
      userId,
      businessName: dto.businessName ?? '',
      ownerName: dto.ownerName ?? '',
      fssaiNumber: dto.fssaiNumber ?? '',
      fssaiDocumentUrl: dto.fssaiDocumentUrl,
      panNumber: dto.panNumber,
      gstin: dto.gstin,
      status: VendorVerificationStatus.DRAFT,
      deletedAt: null,
      deletedBy: null,
    });
    return toVendorProfileResponseDto(created, null);
  }

  async submitForReview(userId: string): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByUserId(userId);
    if (!profile) throw new NotFoundAppException('VendorProfile', userId);

    VENDOR_VERIFICATION_MACHINE.assertTransition(
      profile.status,
      VendorVerificationStatus.SUBMITTED,
    );

    const updated = await this.vendorRepo.updateByIdOrThrow(profile._id, {
      status: VendorVerificationStatus.SUBMITTED,
    });
    const shop = await this.shopRepo.findByVendorId(updated._id);
    return toVendorProfileResponseDto(updated, shop);
  }

  async listVendors(query: ListQueryDto): Promise<PaginatedResult<VendorProfileResponseDto>> {
    const result = await this.vendorRepo.paginate({}, query, {
      sortable: ['businessName', 'createdAt', 'status'],
      searchable: ['businessName', 'ownerName', 'fssaiNumber'],
      defaultSort: '-createdAt',
    });

    const vendorIds = result.items.map((p) => p._id);
    const shops = await this.shopRepo.findMany({ vendorId: { $in: vendorIds } });
    const shopByVendorId = new Map(shops.map((s) => [s.vendorId, s]));

    return result.map((profile) =>
      toVendorProfileResponseDto(profile, shopByVendorId.get(profile._id)),
    );
  }

  async verifyVendor(
    adminId: string,
    vendorId: string,
    dto: VerifyVendorDto,
  ): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByIdOrThrow(vendorId);

    VENDOR_VERIFICATION_MACHINE.assertTransition(profile.status, dto.status, Role.ADMIN);

    const isApproved = dto.status === VendorVerificationStatus.APPROVED;
    const updated = await this.vendorRepo.updateByIdOrThrow(profile._id, {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
      verifiedBy: adminId,
      verifiedAt: isApproved ? new Date() : undefined,
    });

    const shop = await this.shopRepo.findByVendorId(profile._id);

    if (isApproved) {
      await this.userRepo.updateById(profile.userId, { role: Role.VENDOR_OWNER });
      if (shop) {
        await this.shopRepo.updateById(shop._id, { status: ShopStatus.OPEN });
      }
    } else if (dto.status === VendorVerificationStatus.REJECTED && shop) {
      await this.shopRepo.updateById(shop._id, { status: ShopStatus.CLOSED });
    }

    const currentShop = await this.shopRepo.findByVendorId(profile._id);
    return toVendorProfileResponseDto(updated, currentShop);
  }

  async adminCreateVendor(
    adminId: string,
    dto: AdminCreateVendorDto,
  ): Promise<VendorProfileResponseDto> {
    const email =
      dto.email?.toLowerCase().trim() ||
      `${dto.phone}@vendor.virudhunagar-meat.local`;

    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create({
        email,
        phone: dto.phone,
        name: dto.ownerName,
        role: Role.VENDOR_OWNER,
        status: UserStatus.ACTIVE,
        shopId: null,
        deletedAt: null,
        deletedBy: null,
      });
    } else {
      await this.userRepo.updateById(user._id, { role: Role.VENDOR_OWNER });
    }

    let profile = await this.vendorRepo.findByUserId(user._id);
    if (!profile) {
      profile = await this.vendorRepo.create({
        userId: user._id,
        businessName: dto.shopName,
        ownerName: dto.ownerName,
        fssaiNumber: dto.fssaiNumber,
        fssaiDocumentUrl: dto.fssaiDocumentUrl,
        status: VendorVerificationStatus.APPROVED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        deletedAt: null,
        deletedBy: null,
      });
    } else {
      profile = await this.vendorRepo.updateByIdOrThrow(profile._id, {
        status: VendorVerificationStatus.APPROVED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        businessName: dto.shopName,
        ownerName: dto.ownerName,
        fssaiNumber: dto.fssaiNumber,
      });
    }

    let shop = await this.shopRepo.findByVendorId(profile._id);
    if (!shop) {
      let slug = slugify(dto.shopName);
      if (await this.shopRepo.findBySlug(slug)) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      const coords =
        dto.address.location ||
        getVirudhunagarCoords(dto.address.city || dto.address.locality);

      shop = await this.shopRepo.create({
        vendorId: profile._id,
        name: dto.shopName,
        slug,
        phone: dto.phone,
        address: {
          line1: dto.address.line1,
          line2: dto.address.line2,
          locality: dto.address.locality,
          city: dto.address.city,
          district: dto.address.district,
          pincode: dto.address.pincode,
        },
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
        status: ShopStatus.OPEN,
        openingTime: dto.openingTime ?? '06:00',
        closingTime: dto.closingTime ?? '21:00',
        serviceRadiusKm: dto.serviceRadiusKm ?? 10,
        minOrderPaise: 0,
        deliveryFeePaise: 3000,
        images: [],
        deletedAt: null,
        deletedBy: null,
      });
    }

    await this.userRepo.updateById(user._id, { shopId: shop._id });
    return toVendorProfileResponseDto(profile, shop);
  }

  async applyVendor(dto: ApplyVendorDto): Promise<VendorApplicationResponseDto> {
    const email =
      dto.email?.toLowerCase().trim() ||
      `${dto.phone}@vendor.virudhunagar-meat.local`;

    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create({
        email,
        phone: dto.phone,
        name: dto.ownerName,
        role: Role.VENDOR_OWNER,
        status: UserStatus.ACTIVE,
        shopId: null,
        deletedAt: null,
        deletedBy: null,
      });
    }

    let profile = await this.vendorRepo.findByUserId(user._id);
    if (!profile) {
      profile = await this.vendorRepo.create({
        userId: user._id,
        businessName: dto.businessName,
        ownerName: dto.ownerName,
        fssaiNumber: dto.fssaiNumber,
        status: VendorVerificationStatus.SUBMITTED,
        deletedAt: null,
        deletedBy: null,
      });
    } else if (profile.status === VendorVerificationStatus.DRAFT) {
      profile = await this.vendorRepo.updateByIdOrThrow(profile._id, {
        businessName: dto.businessName,
        ownerName: dto.ownerName,
        fssaiNumber: dto.fssaiNumber,
        status: VendorVerificationStatus.SUBMITTED,
      });
    }

    let shop = await this.shopRepo.findByVendorId(profile._id);
    if (!shop) {
      let slug = slugify(dto.businessName);
      if (await this.shopRepo.findBySlug(slug)) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      const coords = getVirudhunagarCoords(dto.town);

      shop = await this.shopRepo.create({
        vendorId: profile._id,
        name: dto.businessName,
        slug,
        phone: dto.phone,
        address: {
          line1: dto.addressLine,
          locality: dto.locality,
          city: dto.town,
          district: 'Virudhunagar',
          pincode: dto.pincode,
        },
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
        },
        status: ShopStatus.CLOSED,
        openingTime: dto.openingTime ?? '06:00',
        closingTime: dto.closingTime ?? '21:00',
        serviceRadiusKm: 8,
        minOrderPaise: 0,
        deliveryFeePaise: 3000,
        images: [],
        deletedAt: null,
        deletedBy: null,
      });
    }

    await this.userRepo.updateById(user._id, { shopId: shop._id });

    return {
      applicationId: profile._id,
      status: profile.status,
      shopId: shop._id,
      message:
        'Vendor application submitted successfully. Verification pending by marketplace admin.',
    };
  }
}
