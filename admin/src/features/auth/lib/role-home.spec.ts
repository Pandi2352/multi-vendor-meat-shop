import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/config/routes';
import { buildLoginPath, getRoleHome, resolvePostLoginPath } from './role-home';

describe('role home', () => {
  it('sends each role to its own home', () => {
    expect(getRoleHome('SUPER_ADMIN')).toBe(ROUTES.DASHBOARD);
    expect(getRoleHome('FINANCE')).toBe(ROUTES.DASHBOARD);
    expect(getRoleHome('VENDOR_OWNER')).toBe(ROUTES.VENDOR_DASHBOARD);
    expect(getRoleHome('VENDOR_STAFF')).toBe(ROUTES.VENDOR_DASHBOARD);
    expect(getRoleHome('DELIVERY_PARTNER')).toBe(ROUTES.DELIVERY_MY_TASKS);
    expect(getRoleHome('CUSTOMER')).toBe(ROUTES.ACCESS_DENIED);
  });

  it('honours a safe in-app next path', () => {
    expect(resolvePostLoginPath('ADMIN', '/admin/vendors?page=2')).toBe('/admin/vendors?page=2');
  });

  it.each(['//evil.com', 'https://evil.com', '/\\evil.com', '/login', '/login?reason=expired', '/accept-invite?token=x', '/forgot-password', '/reset-password?token=x', null, ''])(
    'ignores unsafe or auth-page next %s',
    (next) => {
      expect(resolvePostLoginPath('VENDOR_OWNER', next)).toBe(ROUTES.VENDOR_DASHBOARD);
    },
  );

  it('builds login paths', () => {
    expect(buildLoginPath()).toBe('/login');
    expect(buildLoginPath({ reason: 'expired', next: '/vendor/orders' })).toBe('/login?reason=expired&next=%2Fvendor%2Forders');
    expect(buildLoginPath({ next: '/' })).toBe('/login');
  });
});
