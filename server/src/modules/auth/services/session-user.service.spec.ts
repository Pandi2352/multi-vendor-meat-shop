import { describe, expect, it, vi } from 'vitest';
import { Permission, Role, UserStatus } from '#common/enums';
import { ErrorCode } from '#common/exceptions';
import type { AuthUser } from '#common/interfaces';
import type { UsersService } from '#modules/users';
import { SessionUserService } from './session-user.service.js';

const token: AuthUser = { id: 'u1', role: Role.VENDOR_STAFF, permissions: [], shopId: 'shop-1' };
const account = { _id: 'u1', role: Role.VENDOR_STAFF, status: UserStatus.ACTIVE, shopId: 'shop-1' };

const resolveWith = (stored: unknown) => {
  const users = { findById: vi.fn().mockResolvedValue(stored) };
  return new SessionUserService(users as unknown as UsersService).resolve(token);
};

const codeOf = async (promise: Promise<unknown>) =>
  promise.then(
    () => 'no error',
    (error: { code: ErrorCode }) => error.code,
  );

describe('SessionUserService', () => {
  it('passes an unchanged active account and takes permissions from its current role', async () => {
    const user = await resolveWith(account);
    expect(user.shopId).toBe('shop-1');
    expect(user.permissions).toContain(Permission.ORDER_FULFIL);
    expect(user.permissions).not.toContain(Permission.STAFF_MANAGE);
  });

  it('stops a suspended account at once, even with a valid token', async () => {
    expect(await codeOf(resolveWith({ ...account, status: UserStatus.SUSPENDED }))).toBe(ErrorCode.ACCOUNT_SUSPENDED);
  });

  it('stops staff removed from the shop', async () => {
    expect(await codeOf(resolveWith({ ...account, shopId: null }))).toBe(ErrorCode.AUTH_SESSION_REVOKED);
  });

  it('asks for a fresh token when the role changed', async () => {
    expect(await codeOf(resolveWith({ ...account, role: Role.VENDOR_OWNER }))).toBe(ErrorCode.AUTH_SESSION_REVOKED);
  });

  it('stops a deleted account', async () => {
    expect(await codeOf(resolveWith(null))).toBe(ErrorCode.AUTH_SESSION_REVOKED);
  });
});
