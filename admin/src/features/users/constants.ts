import type { SelectOption } from '@/components/ui';

export const ROLE_OPTIONS: SelectOption[] = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'SUPER_ADMIN', description: 'Platform creator & root access' },
  { label: 'Admin', value: 'ADMIN', description: 'Operations & user manager' },
  { label: 'Operations Staff', value: 'OPERATIONS', description: 'Catalog & stall verifications' },
  { label: 'Finance Manager', value: 'FINANCE', description: 'Ledger, settlements & payouts' },
  { label: 'Customer Support', value: 'SUPPORT', description: 'Support tickets & reviews' },
  { label: 'Stall Owner', value: 'VENDOR_OWNER', description: 'Butcher shop manager' },
  { label: 'Stall Staff / Butcher', value: 'VENDOR_STAFF', description: 'Meat preparation & cutting' },
  { label: 'Delivery Partner', value: 'DELIVERY_PARTNER', description: 'Order pickups & logistics' },
  { label: 'Customer', value: 'CUSTOMER', description: 'Storefront consumer account' },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE', description: 'Normal account standing' },
  { label: 'Inactive', value: 'INACTIVE', description: 'Account not active' },
  { label: 'Suspended', value: 'SUSPENDED', description: 'Temporary lock or penalty' },
];
