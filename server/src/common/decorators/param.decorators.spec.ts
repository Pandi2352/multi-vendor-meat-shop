import { describe, expect, it } from 'vitest';
import { Role } from '#common/enums';
import { ErrorCode } from '#common/exceptions';
import type { AuthUser } from '#common/interfaces';
import { resolveShopId } from './param.decorators.js';

const OWN_SHOP = '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293';
const OTHER_SHOP = '0199f3c8-6a1e-7b2a-9c3d-4e5f60718294';
const user = (role: Role, shopId?: string): AuthUser => ({ id: 'u1', role, permissions: [], shopId });

const codeOf = (fn: () => unknown) => {
  try {
    fn();
    return 'no error';
  } catch (error) {
    return (error as { code: ErrorCode }).code;
  }
};

describe('resolveShopId (@CurrentShop)', () => {
  it('always uses the shop on a vendor account, ignoring what the client sends', () => {
    expect(resolveShopId(user(Role.VENDOR_OWNER, OWN_SHOP), OTHER_SHOP)).toBe(OWN_SHOP);
    expect(resolveShopId(user(Role.VENDOR_STAFF, OWN_SHOP), OTHER_SHOP)).toBe(OWN_SHOP);
  });

  it.each([Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.CUSTOMER, Role.DELIVERY_PARTNER])(
    'never lets %s without a shop pick one',
    (role) => {
      expect(codeOf(() => resolveShopId(user(role), OTHER_SHOP))).toBe(ErrorCode.FORBIDDEN);
    },
  );

  it.each([Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS])('lets %s choose a shop by id', (role) => {
    expect(resolveShopId(user(role), OTHER_SHOP)).toBe(OTHER_SHOP);
  });

  it('refuses an admin request with no shop or a malformed id', () => {
    expect(codeOf(() => resolveShopId(user(Role.ADMIN)))).toBe(ErrorCode.FORBIDDEN);
    expect(codeOf(() => resolveShopId(user(Role.ADMIN), "x' || true"))).toBe(ErrorCode.FORBIDDEN);
  });

  it('requires a signed-in user', () => {
    expect(codeOf(() => resolveShopId(undefined, OTHER_SHOP))).toBe(ErrorCode.UNAUTHORIZED);
  });
});
