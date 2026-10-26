import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { METADATA_KEY } from '#common/constants';
import { Role } from '#common/enums';
import { AppException } from '#common/exceptions';
import { RolesGuard } from './roles.guard.js';

const contextFor = (userRole: Role | null, allowed: Role[]) => {
  const handler = () => undefined;
  Reflect.defineMetadata(METADATA_KEY.ROLES, allowed, handler);
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user: userRole ? { id: 'u1', role: userRole, permissions: [] } : undefined }) }),
  } as unknown as ExecutionContext;
};

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows listed roles and rejects others', () => {
    expect(guard.canActivate(contextFor(Role.FINANCE, [Role.ADMIN, Role.FINANCE]))).toBe(true);
    expect(() => guard.canActivate(contextFor(Role.SUPPORT, [Role.ADMIN]))).toThrow(AppException);
  });

  it('lets a super admin through any route that allows ADMIN', () => {
    expect(guard.canActivate(contextFor(Role.SUPER_ADMIN, [Role.ADMIN, Role.OPERATIONS]))).toBe(true);
  });

  it('does not let a super admin into customer- or vendor-only routes', () => {
    expect(() => guard.canActivate(contextFor(Role.SUPER_ADMIN, [Role.CUSTOMER]))).toThrow(AppException);
    expect(() => guard.canActivate(contextFor(Role.SUPER_ADMIN, [Role.VENDOR_OWNER]))).toThrow(AppException);
  });

  it('requires a signed-in user', () => {
    expect(() => guard.canActivate(contextFor(null, [Role.ADMIN]))).toThrow(AppException);
  });
});
