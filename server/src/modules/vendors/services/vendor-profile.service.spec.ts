import { describe, expect, it, vi } from 'vitest';
import { Role, ShopStatus, UserStatus, VendorVerificationStatus } from '#common/enums';
import { AppException, BusinessRuleException } from '#common/exceptions';
import type { InvitationsService, UserRepository } from '#modules/users';
import type { ShopRepository } from '#modules/shops';
import type { VendorProfileRepository } from '../repositories/vendor-profile.repository.js';
import { VendorProfileService } from './vendor-profile.service.js';

const OWNER_ID = '018f3a52-7b5c-7d92-881b-85fa7d7b5b5d';

const dummyProfile = {
  _id: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c',
  userId: OWNER_ID,
  businessName: 'Murugan Meats',
  ownerName: 'Murugan',
  fssaiNumber: '12423008000123',
  status: VendorVerificationStatus.DRAFT,
  createdAt: new Date('2026-10-23T12:00:00.000Z'),
  updatedAt: new Date('2026-10-23T12:00:00.000Z'),
};

const dummyShop = {
  _id: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5e',
  vendorId: dummyProfile._id,
  name: 'Murugan Meats',
  phone: '9842012345',
  status: ShopStatus.OPEN,
  address: {
    line1: '12 Main Rd',
    locality: 'Town Centre',
    city: 'Virudhunagar',
    district: 'Virudhunagar',
    pincode: '626001',
  },
};

const pendingOwner = {
  _id: OWNER_ID,
  email: 'murugan@example.com',
  name: 'Murugan',
  phone: '9842012345',
  role: Role.VENDOR_OWNER,
  status: UserStatus.PENDING_VERIFICATION,
  passwordHash: null,
};

const issuedInvite = {
  id: 'inv-1',
  inviteUrl: 'http://localhost:3001/accept-invite?token=abc',
  emailSent: true,
};

const applyDto = {
  ownerName: 'M. Ramasamy',
  businessName: 'Sattur Highway Chicken & Mutton',
  phone: '9842012345',
  email: 'ramasamy@example.com',
  town: 'Sattur',
  locality: 'Main Bazaar',
  addressLine: '12 Kovilpatti Rd',
  pincode: '626203',
  fssaiNumber: '12426008000456',
};

const build = (repos: { vendor?: object; user?: object; shop?: object } = {}) => {
  const invitations = { issue: vi.fn().mockResolvedValue(issuedInvite) };
  const service = new VendorProfileService(
    repos.vendor as VendorProfileRepository,
    repos.user as UserRepository,
    repos.shop as ShopRepository,
    invitations as unknown as InvitationsService,
  );
  return { service, invitations };
};

describe('VendorProfileService', () => {
  it('submits a draft profile for review', async () => {
    const { service } = build({
      vendor: {
        findByUserId: vi.fn().mockResolvedValue(dummyProfile),
        updateByIdOrThrow: vi
          .fn()
          .mockResolvedValue({ ...dummyProfile, status: VendorVerificationStatus.SUBMITTED }),
      },
      shop: { findByVendorId: vi.fn().mockResolvedValue(dummyShop) },
    });
    const result = await service.submitForReview(OWNER_ID);
    expect(result.status).toBe(VendorVerificationStatus.SUBMITTED);
  });

  it('approving makes the user a shop owner and emails a set-password invitation', async () => {
    const submitted = { ...dummyProfile, status: VendorVerificationStatus.SUBMITTED };
    const user = {
      updateById: vi.fn().mockResolvedValue({}),
      findByIdOrThrow: vi.fn().mockResolvedValue(pendingOwner),
    };
    const { service, invitations } = build({
      vendor: {
        findByIdOrThrow: vi.fn().mockResolvedValue(submitted),
        updateByIdOrThrow: vi
          .fn()
          .mockResolvedValue({
            ...submitted,
            status: VendorVerificationStatus.APPROVED,
            verifiedAt: new Date(),
          }),
      },
      user,
      shop: {
        findByVendorId: vi.fn().mockResolvedValue(dummyShop),
        updateById: vi.fn().mockResolvedValue(dummyShop),
      },
    });

    const result = await service.verifyVendor('admin-1', dummyProfile._id, {
      status: VendorVerificationStatus.APPROVED,
    });

    expect(result.status).toBe(VendorVerificationStatus.APPROVED);
    expect(user.updateById).toHaveBeenCalledWith(OWNER_ID, { role: Role.VENDOR_OWNER });
    expect(invitations.issue).toHaveBeenCalledWith(
      expect.objectContaining({
        email: pendingOwner.email,
        role: Role.VENDOR_OWNER,
        shopId: dummyShop._id,
        shopName: dummyShop.name,
        invitedBy: 'admin-1',
      }),
    );
    expect(result.invitation).toEqual(issuedInvite);
  });

  it('does not re-invite an owner who can already sign in', async () => {
    const suspended = { ...dummyProfile, status: VendorVerificationStatus.SUSPENDED };
    const activeOwner = { ...pendingOwner, status: UserStatus.ACTIVE, passwordHash: 'salt:hash' };
    const { service, invitations } = build({
      vendor: {
        findByIdOrThrow: vi.fn().mockResolvedValue(suspended),
        updateByIdOrThrow: vi
          .fn()
          .mockResolvedValue({ ...suspended, status: VendorVerificationStatus.APPROVED }),
      },
      user: { updateById: vi.fn(), findByIdOrThrow: vi.fn().mockResolvedValue(activeOwner) },
      shop: { findByVendorId: vi.fn().mockResolvedValue(dummyShop), updateById: vi.fn() },
    });

    const result = await service.verifyVendor('admin-1', dummyProfile._id, {
      status: VendorVerificationStatus.APPROVED,
    });
    expect(invitations.issue).not.toHaveBeenCalled();
    expect(result.invitation).toBeUndefined();
  });

  it('rejects invalid state machine transitions', async () => {
    const { service } = build({
      vendor: { findByIdOrThrow: vi.fn().mockResolvedValue(dummyProfile) }, // DRAFT → APPROVED is illegal
      shop: { findByVendorId: vi.fn().mockResolvedValue(null) },
    });
    await expect(
      service.verifyVendor('admin-1', dummyProfile._id, {
        status: VendorVerificationStatus.APPROVED,
      }),
    ).rejects.toThrow(AppException);
  });

  describe('public application', () => {
    const vendorRepo = () => ({
      findByUserId: vi.fn().mockResolvedValue(null),
      create: vi
        .fn()
        .mockResolvedValue({ ...dummyProfile, status: VendorVerificationStatus.SUBMITTED }),
    });
    const shopRepo = () => ({
      findByVendorId: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(dummyShop),
    });

    it('creates a new applicant as a pending owner who cannot sign in yet', async () => {
      const user = {
        findByEmail: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ _id: OWNER_ID }),
        updateById: vi.fn().mockResolvedValue({}),
      };
      const { service, invitations } = build({ vendor: vendorRepo(), user, shop: shopRepo() });

      const result = await service.applyVendor(applyDto);

      expect(result.applicationId).toBe(dummyProfile._id);
      expect(user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: applyDto.email,
          role: Role.VENDOR_OWNER,
          status: UserStatus.PENDING_VERIFICATION,
        }),
      );
      expect(invitations.issue).not.toHaveBeenCalled(); // invited only once approved
    });

    it('never changes the role of an existing account (no hijacking via the public form)', async () => {
      for (const role of [Role.SUPER_ADMIN, Role.ADMIN, Role.VENDOR_STAFF, Role.DELIVERY_PARTNER]) {
        const user = {
          findByEmail: vi.fn().mockResolvedValue({ _id: 'victim', email: applyDto.email, role }),
          updateById: vi.fn(),
          updateByIdOrThrow: vi.fn(),
          create: vi.fn(),
        };
        const { service } = build({ vendor: vendorRepo(), user, shop: shopRepo() });
        await expect(service.applyVendor(applyDto)).rejects.toBeInstanceOf(BusinessRuleException);
        expect(user.updateById).not.toHaveBeenCalled();
        expect(user.updateByIdOrThrow).not.toHaveBeenCalled();
      }
    });

    it('leaves an existing customer account as it is', async () => {
      const customer = {
        _id: 'cust-1',
        email: applyDto.email,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      };
      const user = {
        findByEmail: vi.fn().mockResolvedValue(customer),
        updateById: vi.fn().mockResolvedValue({}),
        create: vi.fn(),
      };
      const { service } = build({ vendor: vendorRepo(), user, shop: shopRepo() });

      await service.applyVendor(applyDto);
      expect(user.create).not.toHaveBeenCalled();
      // Only the shop link is set; role and status stay customer/active until approval.
      expect(user.updateById).toHaveBeenCalledWith('cust-1', { shopId: dummyShop._id });
    });
  });

  it('admin-created vendors are invited straight away', async () => {
    const user = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(pendingOwner),
      updateByIdOrThrow: vi.fn().mockResolvedValue({ ...pendingOwner, shopId: dummyShop._id }),
    };
    const { service, invitations } = build({
      vendor: {
        findByUserId: vi.fn().mockResolvedValue(null),
        create: vi
          .fn()
          .mockResolvedValue({ ...dummyProfile, status: VendorVerificationStatus.APPROVED }),
      },
      user,
      shop: {
        findByVendorId: vi.fn().mockResolvedValue(null),
        findBySlug: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(dummyShop),
      },
    });

    const result = await service.adminCreateVendor('admin-1', {
      ownerName: 'Murugan',
      shopName: 'Murugan Meats',
      phone: '9842012345',
      email: pendingOwner.email,
      address: {
        line1: '12 Main Rd',
        locality: 'Town Centre',
        city: 'Virudhunagar',
        pincode: '626001',
      },
    } as never);

    expect(invitations.issue).toHaveBeenCalledWith(
      expect.objectContaining({ email: pendingOwner.email, shopName: 'Murugan Meats' }),
    );
    expect(result.invitation?.inviteUrl).toContain('/accept-invite?token=');
  });
});
