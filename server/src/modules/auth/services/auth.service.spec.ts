import { describe, expect, it, vi } from 'vitest';
import { Role, UserStatus } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppConfigService } from '#config';
import type { ShopNameLookup, UserInvitationRepository, UsersService } from '#modules/users';
import type { RefreshSessionRepository } from '../repositories/refresh-session.repository.js';
import { AuthService } from './auth.service.js';
import type { OtpService } from './otp.service.js';
import type { TokenService } from './token.service.js';

const config = { auth: { otp: { resendCooldownSeconds: 60 } } } as unknown as AppConfigService;

const makeUser = (role: Role, status = UserStatus.ACTIVE) => ({
  _id: '019a0000-0000-7000-8000-000000000001',
  email: 'ops@tnmeat.in',
  name: 'Ops',
  role,
  status,
  shopId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const setup = (user: ReturnType<typeof makeUser> | null) => {
  const otp = {
    sendOtp: vi.fn().mockResolvedValue({ sent: true, cooldownSeconds: 60 }),
    verifyOtp: vi.fn().mockResolvedValue(true),
  };
  const users = {
    findByEmail: vi.fn().mockResolvedValue(user),
    findOrCreateByEmail: vi.fn(),
    createOrActivateInvitedUser: vi.fn((data: { role: Role }) => Promise.resolve({ ...makeUser(data.role), ...data })),
  };
  const tokens = { signAccessToken: vi.fn().mockReturnValue('access'), signRefreshToken: vi.fn().mockReturnValue('refresh') };
  const sessions = {
    create: vi.fn().mockResolvedValue({ _id: 'session-1' }),
    updateById: vi.fn().mockResolvedValue({}),
  };
  const invitations = {
    findByToken: vi.fn(),
    findByEmail: vi.fn(),
    updateByIdOrThrow: vi.fn(),
    updateById: vi.fn(),
  };
  const service = new AuthService(
    config,
    otp as unknown as OtpService,
    tokens as unknown as TokenService,
    users as unknown as UsersService,
    sessions as unknown as RefreshSessionRepository,
    invitations as unknown as UserInvitationRepository,
    { nameOf: vi.fn().mockResolvedValue('Muthu Mutton Stall') } as unknown as ShopNameLookup,
  );
  return { service, otp, users, invitations };
};

const expectCode = async (promise: Promise<unknown>, code: ErrorCode) => {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(AppException);
  expect((error as AppException).code).toBe(code);
};

describe('AuthService — admin portal sign-in', () => {
  it('emails a code to an existing portal user', async () => {
    const { service, otp } = setup(makeUser(Role.ADMIN));
    await expect(service.sendPortalOtp({ email: 'ops@tnmeat.in' })).resolves.toEqual({ sent: true, cooldownSeconds: 60 });
    expect(otp.sendOtp).toHaveBeenCalledWith('ops@tnmeat.in');
  });

  it.each([
    ['unknown email', null],
    ['customer account', makeUser(Role.CUSTOMER)],
  ])('answers the same way but sends nothing for an %s', async (_label, user) => {
    const { service, otp } = setup(user);
    await expect(service.sendPortalOtp({ email: 'someone@x.in' })).resolves.toEqual({ sent: true, cooldownSeconds: 60 });
    expect(otp.sendOtp).not.toHaveBeenCalled();
  });

  it('signs in vendor and delivery accounts without creating users', async () => {
    for (const role of [Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.DELIVERY_PARTNER]) {
      const { service, users } = setup(makeUser(role));
      const result = await service.verifyPortalOtp({ email: 'ops@tnmeat.in', otp: '123456' });
      expect(result).toMatchObject({ accessToken: 'access', refreshToken: 'refresh', user: { role } });
      expect(users.findOrCreateByEmail).not.toHaveBeenCalled();
    }
  });

  it('rejects unknown and customer emails with the wrong-code error, before checking the code', async () => {
    for (const user of [null, makeUser(Role.CUSTOMER)]) {
      const { service, otp } = setup(user);
      await expectCode(service.verifyPortalOtp({ email: 'x@x.in', otp: '123456' }), ErrorCode.OTP_INVALID);
      expect(otp.verifyOtp).not.toHaveBeenCalled();
    }
  });

  it('refuses suspended portal accounts', async () => {
    const { service } = setup(makeUser(Role.OPERATIONS, UserStatus.SUSPENDED));
    await expectCode(service.verifyPortalOtp({ email: 'ops@tnmeat.in', otp: '123456' }), ErrorCode.ACCOUNT_SUSPENDED);
  });

  it('refuses pending accounts on every sign-in path, including the code fallback', async () => {
    const { service } = setup(makeUser(Role.VENDOR_OWNER, UserStatus.PENDING_VERIFICATION));
    await expectCode(service.verifyPortalOtp({ email: 'ops@tnmeat.in', otp: '123456' }), ErrorCode.ACCOUNT_PENDING);
  });

  it('treats deleted accounts as unknown credentials', async () => {
    const { service } = setup(makeUser(Role.ADMIN, UserStatus.DELETED));
    await expectCode(service.verifyPortalOtp({ email: 'ops@tnmeat.in', otp: '123456' }), ErrorCode.AUTH_INVALID_CREDENTIALS);
  });
});

describe('AuthService — accepting a shop staff invite', () => {
  const staffInvite = {
    _id: 'inv-1',
    email: 'ops@tnmeat.in',
    role: Role.VENDOR_STAFF,
    shopId: 'shop-1',
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 60_000),
  };
  const accept = (account: ReturnType<typeof makeUser> | null) => {
    const ctx = setup(account);
    ctx.invitations.findByToken.mockResolvedValue(staffInvite);
    return { ...ctx, result: ctx.service.acceptInvitationAndSetPassword({ token: 't', password: 'Mutton@2026' }) };
  };

  it.each([
    ['a new email', null],
    ['a customer', makeUser(Role.CUSTOMER)],
  ])('lets %s join the shop', async (_label, account) => {
    const { result, users } = accept(account);
    await expect(result).resolves.toMatchObject({ user: { role: Role.VENDOR_STAFF } });
    expect(users.createOrActivateInvitedUser).toHaveBeenCalledWith(expect.objectContaining({ role: Role.VENDOR_STAFF, shopId: 'shop-1' }));
  });

  it.each([
    ['became an owner', makeUser(Role.VENDOR_OWNER)],
    ['joined the admin team', makeUser(Role.OPERATIONS)],
    ['is suspended', makeUser(Role.CUSTOMER, UserStatus.SUSPENDED)],
  ])('refuses and cancels the invite when the account %s since', async (_label, account) => {
    const { result, users, invitations } = accept(account);
    await expectCode(result, ErrorCode.BUSINESS_RULE_VIOLATION);
    expect(users.createOrActivateInvitedUser).not.toHaveBeenCalled();
    expect(invitations.updateById).toHaveBeenCalledWith('inv-1', { status: 'REVOKED' });
  });

  it('names the shop on the invite details', async () => {
    const { service, invitations } = setup(null);
    invitations.findByToken.mockResolvedValue(staffInvite);
    await expect(service.getInvitationDetails('t')).resolves.toMatchObject({ shopName: 'Muthu Mutton Stall' });
  });
});
