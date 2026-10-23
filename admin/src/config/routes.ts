export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  // Vendor portal
  VENDOR_SHOPS: '/vendor/shops',
  VENDOR_PRODUCTS: '/vendor/products',
  VENDOR_INVENTORY: '/vendor/inventory',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_ORDER_DETAIL: '/vendor/orders/:orderId',
  VENDOR_SETTLEMENTS: '/vendor/settlements',
  // Delivery portal
  DELIVERY_TASKS: '/delivery/tasks',
  DELIVERY_EARNINGS: '/delivery/earnings',
  // Admin ops
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_USERS: '/admin/users',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_FINANCE: '/admin/finance',
  // Account
  SETTINGS: '/settings',
  SUPPORT: '/support',
} as const;

export const buildPath = (path: string, params: Record<string, string>): string => {
  let result = path;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(val));
  }
  return result;
};
