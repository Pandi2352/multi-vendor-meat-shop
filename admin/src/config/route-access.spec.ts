import { describe, expect, it } from 'vitest';
import type { UserRole } from '@/constants/roles';
import { canAccessPath, roleAllowed } from './route-access';
import { ROUTES } from './routes';

const can = (role: UserRole, path: string) => canAccessPath(role, path);

describe('route access', () => {
  it('lets a super admin in wherever ADMIN is allowed, like the server', () => {
    expect(roleAllowed('SUPER_ADMIN', ['ADMIN'])).toBe(true);
    expect(roleAllowed('SUPER_ADMIN', ['VENDOR_OWNER'])).toBe(false);
    expect(can('SUPER_ADMIN', ROUTES.ADMIN_USERS)).toBe(true);
  });

  it('keeps the dashboard for the admin team only, matching `/` exactly', () => {
    expect(can('FINANCE', '/')).toBe(true);
    expect(can('VENDOR_OWNER', '/')).toBe(false);
  });

  it('gives the shop dashboard to the shop team only', () => {
    expect(can('VENDOR_OWNER', ROUTES.VENDOR_DASHBOARD)).toBe(true);
    expect(can('VENDOR_STAFF', ROUTES.VENDOR_DASHBOARD)).toBe(true);
    expect(can('SUPER_ADMIN', ROUTES.VENDOR_DASHBOARD)).toBe(false);
    expect(can('OPERATIONS', ROUTES.VENDOR_DASHBOARD)).toBe(false);
  });

  it('gives owners the whole shop, staff the day-to-day pages', () => {
    for (const path of [ROUTES.VENDOR_ORDERS, ROUTES.VENDOR_INVENTORY, ROUTES.VENDOR_PRODUCTS, ROUTES.VENDOR_SHOPS]) {
      expect(can('VENDOR_OWNER', path)).toBe(true);
      expect(can('VENDOR_STAFF', path)).toBe(true);
    }
    expect(can('VENDOR_OWNER', ROUTES.VENDOR_STAFF)).toBe(true);
    expect(can('VENDOR_STAFF', ROUTES.VENDOR_STAFF)).toBe(false);
    expect(can('VENDOR_STAFF', ROUTES.VENDOR_SETTLEMENTS)).toBe(false);
  });

  it('applies rules to sub-paths and ignores the query string', () => {
    expect(can('VENDOR_STAFF', '/vendor/orders/0199f3c8-6a1e-7b2a-9c3d-4e5f60718293')).toBe(true);
    expect(can('SUPPORT', '/vendor/orders/abc?tab=items')).toBe(false);
  });

  it('keeps vendors and delivery partners out of administration', () => {
    for (const path of [ROUTES.ADMIN_VENDORS, ROUTES.ADMIN_USERS, ROUTES.ADMIN_DISPUTES, ROUTES.ADMIN_FINANCE]) {
      expect(can('VENDOR_OWNER', path)).toBe(false);
      expect(can('DELIVERY_PARTNER', path)).toBe(false);
    }
  });

  it('scopes admin pages to the matching team', () => {
    expect(can('OPERATIONS', ROUTES.ADMIN_VENDORS)).toBe(true);
    expect(can('FINANCE', ROUTES.ADMIN_VENDORS)).toBe(false);
    expect(can('SUPPORT', ROUTES.ADMIN_DISPUTES)).toBe(true);
    expect(can('FINANCE', ROUTES.ADMIN_FINANCE)).toBe(true);
    expect(can('OPERATIONS', ROUTES.ADMIN_USERS)).toBe(false);
  });

  it('separates dispatch (ops) from a partner’s own deliveries', () => {
    expect(can('OPERATIONS', ROUTES.DELIVERY_TASKS)).toBe(true);
    expect(can('DELIVERY_PARTNER', ROUTES.DELIVERY_TASKS)).toBe(false);
    expect(can('DELIVERY_PARTNER', ROUTES.DELIVERY_MY_TASKS)).toBe(true);
  });

  it('leaves unlisted pages (settings, support) open to every portal user', () => {
    expect(can('VENDOR_STAFF', ROUTES.SETTINGS)).toBe(true);
    expect(can('DELIVERY_PARTNER', ROUTES.SUPPORT)).toBe(true);
  });
});
