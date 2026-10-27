import type { components } from '@/types/api.generated';

export type UserRole = components['schemas']['UserResponseDto']['role'];
export type UserStatus = components['schemas']['UserResponseDto']['status'];

/** Platform team. Mirrors server STAFF_ROLES. */
export const ADMIN_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT', 'FINANCE'];
export const VENDOR_ROLES: readonly UserRole[] = ['VENDOR_OWNER', 'VENDOR_STAFF'];
export const DELIVERY_ROLES: readonly UserRole[] = ['DELIVERY_PARTNER'];

/** Everyone allowed into this portal. Customers use the storefront. Mirrors server PORTAL_ROLES. */
export const PORTAL_ROLES: readonly UserRole[] = [...ADMIN_ROLES, ...VENDOR_ROLES, ...DELIVERY_ROLES];

export const isAdminRole = (role: UserRole): boolean => ADMIN_ROLES.includes(role);
export const isVendorRole = (role: UserRole): boolean => VENDOR_ROLES.includes(role);
export const isDeliveryRole = (role: UserRole): boolean => DELIVERY_ROLES.includes(role);
export const isPortalRole = (role: UserRole): boolean => PORTAL_ROLES.includes(role);

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Administrator',
  OPERATIONS: 'Operations',
  SUPPORT: 'Support',
  FINANCE: 'Finance',
  VENDOR_OWNER: 'Shop owner',
  VENDOR_STAFF: 'Shop staff',
  DELIVERY_PARTNER: 'Delivery partner',
  CUSTOMER: 'Customer',
};
