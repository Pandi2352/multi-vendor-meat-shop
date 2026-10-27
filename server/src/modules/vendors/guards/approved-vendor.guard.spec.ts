import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { METADATA_KEY } from '#common/constants';
import { Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { VendorAccessService } from '../services/vendor-access.service.js';
import { ApprovedVendorGuard } from './approved-vendor.guard.js';

const contextFor = (opts: { method: string; role?: Role; shopId?: string; required?: boolean }) => {
  const handler = () => undefined;
  if (opts.required !== undefined)
    Reflect.defineMetadata(METADATA_KEY.REQUIRE_APPROVED_VENDOR, opts.required, handler);
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({
        method: opts.method,
        user: opts.role
          ? { id: 'u1', role: opts.role, permissions: [], shopId: opts.shopId }
          : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
};

const guardWith = (assertCanSell: () => Promise<void>) => {
  const access = { assertCanSell: vi.fn(assertCanSell) };
  return {
    guard: new ApprovedVendorGuard(new Reflector(), access as unknown as VendorAccessService),
    access,
  };
};

const blocked = () => Promise.reject(new AppException(ErrorCode.VENDOR_NOT_APPROVED));

describe('ApprovedVendorGuard', () => {
  it('ignores routes without @RequireApprovedVendor', async () => {
    const { guard, access } = guardWith(blocked);
    await expect(
      guard.canActivate(contextFor({ method: 'POST', role: Role.VENDOR_OWNER, shopId: 's1' })),
    ).resolves.toBe(true);
    expect(access.assertCanSell).not.toHaveBeenCalled();
  });

  it('honours an explicit opt-out on a handler', async () => {
    const { guard } = guardWith(blocked);
    await expect(
      guard.canActivate(
        contextFor({ method: 'POST', role: Role.VENDOR_OWNER, shopId: 's1', required: false }),
      ),
    ).resolves.toBe(true);
  });

  it('lets unapproved shops read', async () => {
    const { guard, access } = guardWith(blocked);
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      await expect(
        guard.canActivate(
          contextFor({ method, role: Role.VENDOR_STAFF, shopId: 's1', required: true }),
        ),
      ).resolves.toBe(true);
    }
    expect(access.assertCanSell).not.toHaveBeenCalled();
  });

  it('blocks changes by owners and staff of an unapproved shop', async () => {
    const { guard } = guardWith(blocked);
    for (const role of [Role.VENDOR_OWNER, Role.VENDOR_STAFF]) {
      for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
        await expect(
          guard.canActivate(contextFor({ method, role, shopId: 's1', required: true })),
        ).rejects.toMatchObject({
          code: ErrorCode.VENDOR_NOT_APPROVED,
        });
      }
    }
  });

  it('allows changes once approved', async () => {
    const { guard, access } = guardWith(() => Promise.resolve());
    await expect(
      guard.canActivate(
        contextFor({ method: 'PATCH', role: Role.VENDOR_OWNER, shopId: 's1', required: true }),
      ),
    ).resolves.toBe(true);
    expect(access.assertCanSell).toHaveBeenCalledWith('s1');
  });

  it('does not apply to admins acting on vendor routes', async () => {
    const { guard, access } = guardWith(blocked);
    for (const role of [Role.SUPER_ADMIN, Role.ADMIN]) {
      await expect(
        guard.canActivate(contextFor({ method: 'POST', role, required: true })),
      ).resolves.toBe(true);
    }
    expect(access.assertCanSell).not.toHaveBeenCalled();
  });
});
