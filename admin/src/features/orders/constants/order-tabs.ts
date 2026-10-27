import { ROUTES } from '@/config/routes';

export const VENDOR_ORDER_TABS = ['ACTIVE', 'NEW', 'PREP', 'READY', 'COMPLETED'] as const;
export type VendorOrderTab = (typeof VENDOR_ORDER_TABS)[number];

/** Link to the prep queue opened on one tab, e.g. from a dashboard card. */
export const vendorOrdersTabPath = (tab: VendorOrderTab): string =>
  tab === 'ACTIVE' ? ROUTES.VENDOR_ORDERS : `${ROUTES.VENDOR_ORDERS}?tab=${tab}`;
