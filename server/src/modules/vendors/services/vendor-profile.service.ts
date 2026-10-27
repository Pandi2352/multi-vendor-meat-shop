import { Injectable } from '@nestjs/common';
import { Role, ShopStatus, UserStatus, VendorVerificationStatus } from '#common/enums';
import { NotFoundAppException } from '#common/exceptions';
import type { ListQueryDto, PaginatedResult } from '#common/dto';
import {
  InvitationsService,
  UserRepository,
  type User,
  type UserInvitationResponseDto,
} from '#modules/users';
import type { Shop } from '../../shops/schemas/shop.schema.js';
import { ShopRepository } from '../../shops/repositories/shop.repository.js';
import { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import { VENDOR_VERIFICATION_MACHINE } from '../constants/vendor.constants.js';
import type { CreateVendorProfileDto } from '../dto/create-vendor-profile.dto.js';
import type { UpdateVendorProfileDto } from '../dto/update-vendor-profile.dto.js';
import type { VerifyVendorDto } from '../dto/verify-vendor.dto.js';
import type { AdminCreateVendorDto } from '../dto/admin-create-vendor.dto.js';
import type { ApplyVendorDto } from '../dto/apply-vendor.dto.js';
import type { UpdateVendorPermissionsDto } from '../dto/update-vendor-permissions.dto.js';
import type { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';
import type { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto.js';
import { toVendorProfileResponseDto } from '../mappers/vendor-profile.mapper.js';
import { executeAdminCreateVendor, executeApplyVendor } from './vendor-onboarding.helper.js';

@Injectable()
export class VendorProfileService {
  constructor(
    private readonly vendorRepo: VendorProfileRepository,
    private readonly userRepo: UserRepository,
    private readonly shopRepo: ShopRepository,
    private readonly invitations: InvitationsService,
  ) {}

  async getProfileByUserId(userId: string): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByUserId(userId);
    if (!profile) throw new NotFoundAppException('VendorProfile', userId);
    const shop = await this.shopRepo.findByVendorId(profile._id);
    return toVendorProfileResponseDto(profile, shop);
  }

  async getVendorById(vendorId: string): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByIdOrThrow(vendorId);
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
      allowedCategories: [],
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
    const isSuspended = dto.status === VendorVerificationStatus.SUSPENDED;
    const isRejected = dto.status === VendorVerificationStatus.REJECTED;

    const updates: Record<string, unknown> = {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
      verificationNotes: dto.notes,
      verifiedBy: adminId,
      verifiedAt: isApproved ? new Date() : undefined,
    };

    if (dto.allowedCategories) {
      updates.allowedCategories = dto.allowedCategories;
    }
    if (dto.municipalPermitNumber) {
      updates.municipalPermitNumber = dto.municipalPermitNumber;
    }

    const updated = await this.vendorRepo.updateByIdOrThrow(profile._id, updates);
    const shop = await this.shopRepo.findByVendorId(profile._id);

    if (isApproved) {
      await this.userRepo.updateById(profile.userId, { role: Role.VENDOR_OWNER });
      if (shop) {
        await this.shopRepo.updateById(shop._id, { status: ShopStatus.OPEN });
      }
    } else if ((isRejected || isSuspended) && shop) {
      await this.shopRepo.updateById(shop._id, { status: ShopStatus.CLOSED });
    }

    const currentShop = await this.shopRepo.findByVendorId(profile._id);
    const response = toVendorProfileResponseDto(updated, currentShop);
    if (isApproved && currentShop) {
      const owner = await this.userRepo.findByIdOrThrow(profile.userId);
      response.invitation = await this.inviteOwnerIfNeeded(owner, currentShop, adminId);
    }
    return response;
  }

  async updatePermissions(
    vendorId: string,
    dto: UpdateVendorPermissionsDto,
  ): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByIdOrThrow(vendorId);
    const updated = await this.vendorRepo.updateByIdOrThrow(profile._id, {
      allowedCategories: dto.allowedCategories,
    });
    const shop = await this.shopRepo.findByVendorId(profile._id);
    return toVendorProfileResponseDto(updated, shop);
  }

  async adminCreateVendor(
    adminId: string,
    dto: AdminCreateVendorDto,
  ): Promise<VendorProfileResponseDto> {
    const { profile, shop, user } = await executeAdminCreateVendor(
      { userRepo: this.userRepo, vendorRepo: this.vendorRepo, shopRepo: this.shopRepo },
      adminId,
      dto,
    );
    const response = toVendorProfileResponseDto(profile, shop);
    response.invitation = await this.inviteOwnerIfNeeded(user, shop, adminId);
    return response;
  }

  async applyVendor(dto: ApplyVendorDto): Promise<VendorApplicationResponseDto> {
    return executeApplyVendor(
      { userRepo: this.userRepo, vendorRepo: this.vendorRepo, shopRepo: this.shopRepo },
      dto,
    );
  }

  /**
   * Emails the owner a set-password invitation, unless they can already sign in as an active owner.
   * Returns the issued invitation (with its one-time link) or undefined when none was needed.
   */
  private async inviteOwnerIfNeeded(
    owner: User,
    shop: Shop,
    adminId: string,
  ): Promise<UserInvitationResponseDto | undefined> {
    const canAlreadySignIn =
      owner.role === Role.VENDOR_OWNER &&
      owner.status === UserStatus.ACTIVE &&
      Boolean(owner.passwordHash);
    if (canAlreadySignIn) return undefined;

    return this.invitations.issue({
      email: owner.email,
      role: Role.VENDOR_OWNER,
      invitedBy: adminId,
      name: owner.name,
      phone: owner.phone,
      shopId: shop._id,
      shopName: shop.name,
    });
  }
}
