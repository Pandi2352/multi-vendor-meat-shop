import { Injectable } from '@nestjs/common';
import { Role, VendorVerificationStatus } from '#common/enums';
import { NotFoundAppException } from '#common/exceptions';
import type { ListQueryDto, PaginatedResult } from '#common/dto';
import { UserRepository } from '#modules/users';
import { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import { VENDOR_VERIFICATION_MACHINE } from '../constants/vendor.constants.js';
import type { CreateVendorProfileDto } from '../dto/create-vendor-profile.dto.js';
import type { UpdateVendorProfileDto } from '../dto/update-vendor-profile.dto.js';
import type { VerifyVendorDto } from '../dto/verify-vendor.dto.js';
import type { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';
import { toVendorProfileResponseDto } from '../mappers/vendor-profile.mapper.js';

@Injectable()
export class VendorProfileService {
  constructor(
    private readonly vendorRepo: VendorProfileRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async getProfileByUserId(userId: string): Promise<VendorProfileResponseDto> {
    const profile = await this.vendorRepo.findByUserId(userId);
    if (!profile) throw new NotFoundAppException('VendorProfile', userId);
    return toVendorProfileResponseDto(profile);
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
      return toVendorProfileResponseDto(updated);
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
    return toVendorProfileResponseDto(created);
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
    return toVendorProfileResponseDto(updated);
  }

  async listVendors(query: ListQueryDto): Promise<PaginatedResult<VendorProfileResponseDto>> {
    const result = await this.vendorRepo.paginate({}, query, {
      sortable: ['businessName', 'createdAt', 'status'],
      searchable: ['businessName', 'ownerName', 'fssaiNumber'],
      defaultSort: '-createdAt',
    });
    return result.map(toVendorProfileResponseDto);
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

    if (isApproved) {
      await this.userRepo.updateById(profile.userId, { role: Role.VENDOR_OWNER });
    }

    return toVendorProfileResponseDto(updated);
  }
}
