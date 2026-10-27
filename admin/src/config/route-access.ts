import { matchPath } from 'react-router-dom';
import { ADMIN_ROLES, type UserRole } from '@/constants/roles';
import { ROUTES } from './routes';

interface RouteAccessRule {
  path: string;
  roles: readonly UserRole[];
  /** Match the path exactly (needed for `/`). Otherwise sub-paths inherit the rule. */
  end?: boolean;
}

const OWNER: readonly UserRole[] = ['VENDOR_OWNER'];
const SHOP_TEAM: readonly UserRole[] = ['VENDOR_OWNER', 'VENDOR_STAFF'];

/**
 * Who may open each portal page. Single source for the route guard, sidebar, search,
 * breadcrumb and quick actions. Mirrors the server's `@Auth()` roles for the API each page calls.
 * `ADMIN` also admits `SUPER_ADMIN` (as on the server). Pages not listed are open to every portal user.
 */
export const ROUTE_ACCESS: readonly RouteAccessRule[] = [
  { path: ROUTES.DASHBOARD, roles: ADMIN_ROLES, end: true },

  // Shop operations — always the signed-in vendor's own shop
  { path: ROUTES.VENDOR_ORDERS, roles: SHOP_TEAM },
  { path: ROUTES.VENDOR_INVENTORY, roles: SHOP_TEAM },
  { path: ROUTES.VENDOR_PRODUCTS, roles: SHOP_TEAM },
  { path: ROUTES.VENDOR_SHOPS, roles: SHOP_TEAM },
  { path: ROUTES.VENDOR_STAFF, roles: OWNER },
  { path: ROUTES.VENDOR_SETTLEMENTS, roles: OWNER },

  // Delivery
  { path: ROUTES.DELIVERY_TASKS, roles: ['ADMIN', 'OPERATIONS'] },
  { path: ROUTES.DELIVERY_MY_TASKS, roles: ['DELIVERY_PARTNER'] },
  { path: ROUTES.DELIVERY_EARNINGS, roles: ['DELIVERY_PARTNER'] },

  // Administration
  { path: ROUTES.ADMIN_VENDORS, roles: ['ADMIN', 'OPERATIONS'] },
  { path: ROUTES.ADMIN_USERS, roles: ['ADMIN'] },
  { path: ROUTES.ADMIN_DISPUTES, roles: ['ADMIN', 'SUPPORT'] },
  { path: ROUTES.ADMIN_FINANCE, roles: ['ADMIN', 'FINANCE'] },
];

/** Same rule as the server's RolesGuard: a super admin passes wherever ADMIN is allowed. */
export const roleAllowed = (role: UserRole, allowed: readonly UserRole[]): boolean =>
  allowed.includes(role) || (role === 'SUPER_ADMIN' && allowed.includes('ADMIN'));

/** The most specific rule for a path (`/vendor/orders/123` → the Orders rule), if any. */
export const findAccessRule = (pathname: string): RouteAccessRule | undefined =>
  ROUTE_ACCESS.filter((rule) => matchPath({ path: rule.path, end: rule.end ?? false }, pathname)).sort(
    (a, b) => b.path.length - a.path.length,
  )[0];

export const canAccessPath = (role: UserRole, pathname: string): boolean => {
  const rule = findAccessRule(pathname.split('?')[0]);
  return !rule || roleAllowed(role, rule.roles);
};
