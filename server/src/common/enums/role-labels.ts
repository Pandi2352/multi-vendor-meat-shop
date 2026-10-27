import { Role } from './role.enum.js';

/** Human role names for emails and messages. Keep in sync with admin `constants/roles.ts`. */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  [Role.SUPER_ADMIN]: 'Super admin',
  [Role.ADMIN]: 'Administrator',
  [Role.OPERATIONS]: 'Operations',
  [Role.SUPPORT]: 'Support',
  [Role.FINANCE]: 'Finance',
  [Role.VENDOR_OWNER]: 'Shop owner',
  [Role.VENDOR_STAFF]: 'Shop staff',
  [Role.DELIVERY_PARTNER]: 'Delivery partner',
  [Role.CUSTOMER]: 'Customer',
};
