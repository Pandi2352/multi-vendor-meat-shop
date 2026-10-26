export enum Role {
  /** Seeded from SUPER_ADMIN_EMAIL. Passes every check that allows ADMIN; cannot be invited. */
  SUPER_ADMIN = 'SUPER_ADMIN',
  CUSTOMER = 'CUSTOMER',
  VENDOR_OWNER = 'VENDOR_OWNER',
  VENDOR_STAFF = 'VENDOR_STAFF',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  ADMIN = 'ADMIN',
  OPERATIONS = 'OPERATIONS',
  SUPPORT = 'SUPPORT',
  FINANCE = 'FINANCE',
}

export const VENDOR_ROLES = [Role.VENDOR_OWNER, Role.VENDOR_STAFF] as const;
export const STAFF_ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATIONS, Role.SUPPORT, Role.FINANCE] as const;

/** Roles that may sign in to the admin portal (invite-only). Customers use the storefront. */
export const PORTAL_ROLES: readonly Role[] = [...STAFF_ROLES, ...VENDOR_ROLES, Role.DELIVERY_PARTNER];

export const isPortalRole = (role: Role): boolean => PORTAL_ROLES.includes(role);
