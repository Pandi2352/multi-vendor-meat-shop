import { Injectable } from '@nestjs/common';
import { ShopStatus, VendorVerificationStatus } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import { ShopRepository } from '../../shops/repositories/shop.repository.js';
import { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';

export interface VendorAccessStatus {
  status: VendorVerificationStatus;
  canSell: boolean;
  /** Admin's reason (rejection / suspension). */
  reason?: string;
  /** Admin's notes (e.g. requested changes). */
  notes?: string;
  shopId: string;
  shopName: string;
  shopStatus: ShopStatus;
}

/** Why changes are blocked, worded for the shop owner. */
const BLOCKED_MESSAGE: Partial<Record<VendorVerificationStatus, string>> = {
  [VendorVerificationStatus.SUSPENDED]:
    'Your shop is suspended. Products, stock, shop details and staff can’t be changed until an admin re-activates it.',
  [VendorVerificationStatus.REJECTED]:
    'Your shop application was rejected, so the shop can’t be changed.',
  [VendorVerificationStatus.RESUBMISSION_REQUIRED]:
    'Your shop needs changes before it can sell. Fix the requested items and resubmit for review.',
};
const DEFAULT_BLOCKED =
  'Your shop is still being reviewed. You can make changes once it is approved.';

/** Answers "may this shop sell right now?" for the approval gate and the portal banner. */
@Injectable()
export class VendorAccessService {
  constructor(
    private readonly shops: ShopRepository,
    private readonly vendors: VendorProfileRepository,
  ) {}

  async getStatus(shopId: string): Promise<VendorAccessStatus> {
    const shop = await this.shops.findByIdOrThrow(shopId);
    const profile = await this.vendors.findByIdOrThrow(shop.vendorId);
    return {
      status: profile.status,
      canSell: profile.status === VendorVerificationStatus.APPROVED,
      reason: profile.rejectionReason || undefined,
      notes: profile.verificationNotes || undefined,
      shopId: shop._id,
      shopName: shop.name,
      shopStatus: shop.status,
    };
  }

  /** Throws VENDOR_NOT_APPROVED (with status + reason in details) unless the shop is approved. */
  async assertCanSell(shopId: string | undefined): Promise<void> {
    if (!shopId) {
      throw new AppException(ErrorCode.VENDOR_NOT_APPROVED, {
        message: 'Your account isn’t linked to a shop yet.',
      });
    }
    const access = await this.getStatus(shopId);
    if (access.canSell) return;
    throw new AppException(ErrorCode.VENDOR_NOT_APPROVED, {
      message: BLOCKED_MESSAGE[access.status] ?? DEFAULT_BLOCKED,
      details: { status: access.status, reason: access.reason },
    });
  }
}
