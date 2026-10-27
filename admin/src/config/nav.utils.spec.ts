import { describe, expect, it } from 'vitest';
import type { UserRole } from '@/constants/roles';
import { filterNavForRole, flattenNav, searchNav } from './nav.utils';

const labelsFor = (role: UserRole) => flattenNav(filterNavForRole(role)).map((entry) => entry.label);
const sectionsFor = (role: UserRole) => filterNavForRole(role).map((section) => section.label);

describe('filterNavForRole', () => {
  it('gives a shop owner the whole shop and nothing from administration', () => {
    expect(sectionsFor('VENDOR_OWNER')).toEqual(['Shop operations']);
    expect(labelsFor('VENDOR_OWNER')).toEqual(
      expect.arrayContaining(['Orders', 'Inventory', 'Products', 'Shop profile', 'Stall team', 'Settlements']),
    );
    expect(labelsFor('VENDOR_OWNER')).not.toContain('Dashboard');
  });

  it('gives shop staff the day-to-day pages only', () => {
    const staff = labelsFor('VENDOR_STAFF');
    expect(staff).toEqual(expect.arrayContaining(['Orders', 'Inventory', 'Products', 'Shop profile']));
    expect(staff).not.toContain('Stall team');
    expect(staff).not.toContain('Settlements');
  });

  it('drops a group whose children are all hidden, keeping the rest', () => {
    const catalogue = filterNavForRole('VENDOR_STAFF')
      .flatMap((section) => section.items)
      .find((item) => item.type === 'group' && item.id === 'catalogue');
    expect(catalogue?.type === 'group' && catalogue.children.map((c) => c.label)).toEqual(['Products', 'Shop profile']);
  });

  it('shows a delivery partner only their own deliveries', () => {
    expect(labelsFor('DELIVERY_PARTNER')).toEqual(['My deliveries', 'Earnings']);
  });

  it('scopes the admin team by role, super admin sees all administration', () => {
    expect(labelsFor('SUPER_ADMIN')).toEqual(
      expect.arrayContaining(['Dashboard', 'Delivery tasks', 'Vendors', 'Users', 'Disputes', 'Finance']),
    );
    expect(labelsFor('SUPER_ADMIN')).not.toContain('Orders');
    expect(labelsFor('FINANCE')).toEqual(['Dashboard', 'Finance']);
    expect(labelsFor('SUPPORT')).toEqual(['Dashboard', 'Disputes']);
    expect(labelsFor('OPERATIONS')).toEqual(['Dashboard', 'Delivery tasks', 'Vendors']);
  });

  it('feeds search, so hidden pages cannot be found', () => {
    const vendorNav = filterNavForRole('VENDOR_STAFF');
    expect(searchNav('users', vendorNav)).toEqual([]);
    expect(searchNav('inventory', vendorNav).map((e) => e.label)).toEqual(['Inventory']);
  });
});
