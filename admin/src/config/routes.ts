export const ROUTES = {
  LOGIN: '/login',
  LOGIN_VERIFY: '/login/verify',
  ACCEPT_INVITE: '/accept-invite',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCESS_DENIED: '/access-denied',
  SUSPENDED: '/suspended',
  DASHBOARD: '/',
  // Vendor portal
  VENDOR_DASHBOARD: '/vendor',
  VENDOR_SHOPS: '/vendor/shops',
  VENDOR_PRODUCTS: '/vendor/products',
  VENDOR_STAFF: '/vendor/staff',
  VENDOR_INVENTORY: '/vendor/inventory',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_ORDER_DETAIL: '/vendor/orders/:orderId',
  VENDOR_SETTLEMENTS: '/vendor/settlements',
  // Delivery portal
  /** Dispatch board for the operations team (admin delivery endpoints). */
  DELIVERY_TASKS: '/delivery/tasks',
  /** A delivery partner's own assignments. */
  DELIVERY_MY_TASKS: '/delivery/my-tasks',
  DELIVERY_EARNINGS: '/delivery/earnings',
  // Admin ops
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_VENDORS_NEW: '/admin/vendors/new',
  ADMIN_VENDORS_EDIT: '/admin/vendors/:id/edit',
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
