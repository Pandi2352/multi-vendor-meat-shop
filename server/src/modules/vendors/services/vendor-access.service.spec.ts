import { describe, expect, it, vi } from 'vitest';
import { ShopStatus, VendorVerificationStatus } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { ShopRepository } from '../../shops/repositories/shop.repository.js';
import type { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import { VendorAccessService } from './vendor-access.service.js';

const serviceFor = (status: VendorVerificationStatus, reason?: string) =>
  new VendorAccessService(
    {
      findByIdOrThrow: vi
        .fn()
        .mockResolvedValue({
          _id: 's1',
          vendorId: 'v1',
          name: 'Muthu Mutton',
          status: ShopStatus.CLOSED,
        }),
    } as unknown as ShopRepository,
    {
      findByIdOrThrow: vi.fn().mockResolvedValue({ _id: 'v1', status, rejectionReason: reason }),
    } as unknown as VendorProfileRepository,
  );

describe('VendorAccessService', () => {
  it('reports approved shops as able to sell', async () => {
    await expect(
      serviceFor(VendorVerificationStatus.APPROVED).getStatus('s1'),
    ).resolves.toMatchObject({
      status: VendorVerificationStatus.APPROVED,
      canSell: true,
      shopName: 'Muthu Mutton',
    });
    await expect(
      serviceFor(VendorVerificationStatus.APPROVED).assertCanSell('s1'),
    ).resolves.toBeUndefined();
  });

  it.each([
    [VendorVerificationStatus.SUSPENDED, /suspended/],
    [VendorVerificationStatus.REJECTED, /rejected/],
    [VendorVerificationStatus.RESUBMISSION_REQUIRED, /needs changes/],
    [VendorVerificationStatus.UNDER_REVIEW, /being reviewed/],
  ])(
    'blocks %s shops with a matching explanation and the admin reason',
    async (status, message) => {
      const error = await serviceFor(status, 'Hygiene inspection pending')
        .assertCanSell('s1')
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(AppException);
      expect((error as AppException).code).toBe(ErrorCode.VENDOR_NOT_APPROVED);
      expect((error as AppException).message).toMatch(message);
      expect((error as AppException).details).toEqual({
        status,
        reason: 'Hygiene inspection pending',
      });
    },
  );

  it('blocks accounts without a shop', async () => {
    await expect(
      serviceFor(VendorVerificationStatus.APPROVED).assertCanSell(undefined),
    ).rejects.toMatchObject({
      code: ErrorCode.VENDOR_NOT_APPROVED,
    });
  });
});
