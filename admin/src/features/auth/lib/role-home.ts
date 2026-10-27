import { ROUTES } from '@/config/routes';
import { isAdminRole, isDeliveryRole, isVendorRole, type UserRole } from '@/constants/roles';

/** Where each role lands after signing in (and when opening `/`). */
export const getRoleHome = (role: UserRole): string => {
  if (isAdminRole(role)) return ROUTES.DASHBOARD;
  // Vendors land on the live prep queue until the vendor dashboard (V3) exists.
  if (isVendorRole(role)) return ROUTES.VENDOR_ORDERS;
  if (isDeliveryRole(role)) return ROUTES.DELIVERY_MY_TASKS;
  return ROUTES.ACCESS_DENIED;
};

const AUTH_PATHS: readonly string[] = [ROUTES.LOGIN, ROUTES.LOGIN_VERIFY, ROUTES.ACCEPT_INVITE];

/**
 * `next` from the URL, only if it is an in-app path (blocks `//evil.com`, `https://…` and loops
 * back to the sign-in pages). Otherwise the role's home.
 */
export const resolvePostLoginPath = (role: UserRole, next: string | null): string => {
  const isSafe = !!next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\');
  const isAuthPage = !!next && AUTH_PATHS.some((path) => next === path || next.startsWith(`${path}?`) || next.startsWith(`${path}/`));
  return isSafe && !isAuthPage ? next : getRoleHome(role);
};

/** `/login?reason=…&next=…` */
export const buildLoginPath = (options: { reason?: string; next?: string } = {}): string => {
  const params = new URLSearchParams();
  if (options.reason) params.set('reason', options.reason);
  if (options.next && options.next !== '/') params.set('next', options.next);
  const query = params.toString();
  return query ? `${ROUTES.LOGIN}?${query}` : ROUTES.LOGIN;
};
