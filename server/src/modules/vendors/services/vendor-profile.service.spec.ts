import { describe, expect, it, vi } from 'vitest';
import { Role, VendorVerificationStatus } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { UserRepository } from '#modules/users';
import type { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import { VendorProfileService } from './vendor-profile.service.js';

describe('VendorProfileService', () => {
  const dummyProfile = {
    _id: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c',
    userId: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5d',
    businessName: 'Murugan Meats',
    ownerName: 'Murugan',
    fssaiNumber: '12423008000123',
    status: VendorVerificationStatus.DRAFT,
    createdAt: new Date('2026-10-23T12:00:00.000Z'),
    updatedAt: new Date('2026-10-23T12:00:00.000Z'),
  };

  it('submits profile for review via state machine', async () => {
    const mockVendorRepo = {
      findByUserId: vi.fn().mockResolvedValue(dummyProfile),
      updateByIdOrThrow: vi.fn().mockResolvedValue({
        ...dummyProfile,
        status: VendorVerificationStatus.SUBMITTED,
      }),
    } as unknown as VendorProfileRepository;
    const mockUserRepo = {} as unknown as UserRepository;

    const service = new VendorProfileService(mockVendorRepo, mockUserRepo);
    const result = await service.submitForReview(dummyProfile.userId);

    expect(result.status).toBe(VendorVerificationStatus.SUBMITTED);
  });

  it('approves vendor and upgrades user role to VENDOR_OWNER', async () => {
    const submittedProfile = {
      ...dummyProfile,
      status: VendorVerificationStatus.SUBMITTED,
    };
    const mockVendorRepo = {
      findByIdOrThrow: vi.fn().mockResolvedValue(submittedProfile),
      updateByIdOrThrow: vi.fn().mockResolvedValue({
        ...submittedProfile,
        status: VendorVerificationStatus.APPROVED,
        verifiedAt: new Date(),
      }),
    } as unknown as VendorProfileRepository;
    const mockUserRepo = {
      updateById: vi.fn().mockResolvedValue({}),
    } as unknown as UserRepository;

    const service = new VendorProfileService(mockVendorRepo, mockUserRepo);
    const result = await service.verifyVendor('admin-1', dummyProfile._id, {
      status: VendorVerificationStatus.APPROVED,
    });

    expect(result.status).toBe(VendorVerificationStatus.APPROVED);
    expect(mockUserRepo.updateById).toHaveBeenCalledWith(dummyProfile.userId, {
      role: Role.VENDOR_OWNER,
    });
  });

  it('rejects invalid state machine transitions', async () => {
    const mockVendorRepo = {
      findByIdOrThrow: vi.fn().mockResolvedValue(dummyProfile), // DRAFT
    } as unknown as VendorProfileRepository;
    const mockUserRepo = {} as unknown as UserRepository;

    const service = new VendorProfileService(mockVendorRepo, mockUserRepo);
    // DRAFT directly to APPROVED is illegal
    await expect(
      service.verifyVendor('admin-1', dummyProfile._id, {
        status: VendorVerificationStatus.APPROVED,
      }),
    ).rejects.toThrow(AppException);
  });
});
