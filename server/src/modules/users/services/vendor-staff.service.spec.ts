import { describe, expect, it, vi } from 'vitest';
import { InvitationStatus, Role, UserStatus } from '#common/enums';
import type { UserRepository } from '../repositories/user.repository.js';
import type { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import type { InvitationsService } from './invitations.service.js';
import type { ShopNameLookup } from './shop-name.lookup.js';
import { canJoinShopAsStaff } from './staff-invite-rules.js';
import { VendorStaffService } from './vendor-staff.service.js';

const SHOP = 'shop-1';
const person = (fields: Record<string, unknown> = {}) => ({
  _id: 'user-1',
  email: 'senthil@example.com',
  name: 'Senthil',
  role: Role.VENDOR_STAFF,
  status: UserStatus.ACTIVE,
  shopId: SHOP,
  createdAt: new Date('2026-10-01T00:00:00Z'),
  ...fields,
});
const invite = (fields: Record<string, unknown> = {}) => ({
  _id: 'inv-1',
  email: 'senthil@example.com',
  role: Role.VENDOR_STAFF,
  shopId: SHOP,
  status: InvitationStatus.PENDING,
  expiresAt: new Date(Date.now() + 86_400_000),
  createdAt: new Date(),
  ...fields,
});

interface SetupOptions {
  account?: unknown;
  existingInvite?: unknown;
  byId?: unknown;
  inviteById?: unknown;
}

const setup = ({ account = null, existingInvite = null, byId = null, inviteById = null }: SetupOptions = {}) => {
  const users = {
    findByEmail: vi.fn().mockResolvedValue(account),
    findById: vi.fn().mockResolvedValue(byId),
    findMany: vi.fn().mockResolvedValue([]),
    updateByIdOrThrow: vi.fn((_id: string, update: object) => Promise.resolve({ ...(byId as object), ...update })),
  };
  const invitationRepo = {
    findByEmail: vi.fn().mockResolvedValue(existingInvite),
    findById: vi.fn().mockResolvedValue(inviteById),
    findMany: vi.fn().mockResolvedValue([]),
    updateByIdOrThrow: vi.fn().mockResolvedValue({}),
    updateOne: vi.fn().mockResolvedValue(true),
  };
  const invitations = {
    issue: vi.fn().mockResolvedValue({ id: 'inv-1', inviteUrl: 'http://x', emailSent: true }),
    resend: vi.fn().mockResolvedValue({ id: 'inv-1', inviteUrl: 'http://y', emailSent: true }),
  };
  const service = new VendorStaffService(
    users as unknown as UserRepository,
    invitationRepo as unknown as UserInvitationRepository,
    invitations as unknown as InvitationsService,
    { nameOf: vi.fn().mockResolvedValue('Muthu Mutton Stall') } as unknown as ShopNameLookup,
  );
  return { service, users, invitationRepo, invitations };
};

const dto = { name: 'Senthil', email: ' Senthil@Example.com ' };
const rejects = (promise: Promise<unknown>) => expect(promise).rejects.toBeTruthy();

describe('canJoinShopAsStaff', () => {
  it.each([
    ['no account yet', null, true],
    ['a customer', person({ role: Role.CUSTOMER, shopId: null }), true],
    ['this shop’s staff', person(), true],
    ['an invitee of this shop', person({ status: UserStatus.PENDING_VERIFICATION, shopId: null }), true],
    ['another shop’s staff', person({ shopId: 'shop-2' }), false],
    ['an owner', person({ role: Role.VENDOR_OWNER }), false],
    ['an admin', person({ role: Role.ADMIN, shopId: null }), false],
    ['a delivery partner', person({ role: Role.DELIVERY_PARTNER, shopId: null }), false],
    ['a suspended customer', person({ role: Role.CUSTOMER, shopId: null, status: UserStatus.SUSPENDED }), false],
  ])('%s → %s', (_label, account, expected) => {
    expect(canJoinShopAsStaff(account as never, SHOP)).toBe(expected);
  });
});

describe('VendorStaffService.addStaff', () => {
  it('invites without creating or changing an account, and names the shop', async () => {
    const { service, invitations, users } = setup({ account: person({ role: Role.CUSTOMER, shopId: null }) });
    await service.addStaff(SHOP, 'owner-1', dto);
    expect(invitations.issue).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'senthil@example.com', role: Role.VENDOR_STAFF, shopId: SHOP, shopName: 'Muthu Mutton Stall' }),
    );
    expect(users.updateByIdOrThrow).not.toHaveBeenCalled();
  });

  it('refuses someone already on the team', () => rejects(setup({ account: person() }).service.addStaff(SHOP, 'o', dto)));
  it('refuses another shop’s staff', () => rejects(setup({ account: person({ shopId: 'shop-2' }) }).service.addStaff(SHOP, 'o', dto)));
  it('refuses to overwrite another shop’s pending invite', () =>
    rejects(setup({ existingInvite: invite({ shopId: 'shop-2' }) }).service.addStaff(SHOP, 'o', dto)));

  it('re-issues this shop’s own pending invite', async () => {
    const { service, invitations } = setup({ existingInvite: invite() });
    await service.addStaff(SHOP, 'o', dto);
    expect(invitations.issue).toHaveBeenCalled();
  });
});

describe('VendorStaffService invites and removal', () => {
  it('resends and cancels only this shop’s pending staff invites', async () => {
    await rejects(setup({ inviteById: invite({ shopId: 'shop-2' }) }).service.resendInvitation(SHOP, 'o', 'inv-1'));
    await rejects(setup({ inviteById: invite({ role: Role.ADMIN }) }).service.cancelInvitation(SHOP, 'inv-1'));
    await rejects(setup({ inviteById: invite({ status: InvitationStatus.ACCEPTED }) }).service.cancelInvitation(SHOP, 'inv-1'));

    const { service, invitationRepo, invitations } = setup({ inviteById: invite() });
    await service.resendInvitation(SHOP, 'o', 'inv-1');
    expect(invitations.resend).toHaveBeenCalledWith('inv-1', 'o', 'Muthu Mutton Stall');
    await service.cancelInvitation(SHOP, 'inv-1');
    expect(invitationRepo.updateByIdOrThrow).toHaveBeenCalledWith('inv-1', { status: InvitationStatus.REVOKED });
  });

  it('turns a removed staff member back into a customer of nobody’s shop', async () => {
    const { service, users, invitationRepo } = setup({ byId: person({ status: UserStatus.SUSPENDED }) });
    await service.removeStaff(SHOP, 'user-1');
    expect(users.updateByIdOrThrow).toHaveBeenCalledWith('user-1', {
      role: Role.CUSTOMER,
      shopId: null,
      dutyTitle: null,
      status: UserStatus.ACTIVE,
    });
    expect(invitationRepo.updateOne).toHaveBeenCalled();
  });

  it('never edits or removes the owner, or another shop’s staff', async () => {
    await rejects(setup({ byId: person({ role: Role.VENDOR_OWNER }) }).service.removeStaff(SHOP, 'user-1'));
    await rejects(setup({ byId: person({ role: Role.VENDOR_OWNER }) }).service.updateStaff(SHOP, 'user-1', { name: 'X' }));
    await rejects(setup({ byId: person({ shopId: 'shop-2' }) }).service.removeStaff(SHOP, 'user-1'));
  });

  it('lists the owner first and leaves invitees to the invitations list', async () => {
    const { service, users } = setup();
    users.findMany.mockResolvedValue([person({ _id: 'b', name: 'Bala' }), person({ _id: 'o', name: 'Muthu', role: Role.VENDOR_OWNER }), person({ _id: 'a', name: 'Arun' })]);
    const list = await service.listStaff(SHOP);
    expect(list.staff.map((m) => m.id)).toEqual(['o', 'a', 'b']);
    expect(users.findMany.mock.calls[0][0]).toMatchObject({ status: { $ne: UserStatus.PENDING_VERIFICATION } });
  });
});
