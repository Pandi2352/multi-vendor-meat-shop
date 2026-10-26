import { createBrowserRouter, useRouteError, type RouteObject } from 'react-router-dom';
import { AdminLayout, AuthLayout, NotFoundPage, RouteErrorPage } from '@/components/layout';
import { AcceptInvitePage, SignInPage, VerifyCodePage } from '@/features/auth';
import { flattenNav } from '@/config/nav.utils';
import { ROUTES } from '@/config/routes';
import { DeliveryTasksPage } from '@/features/delivery';
import { AdminDisputesPage } from '@/features/disputes';
import { AdminFinancePage, VendorSettlementsPage } from '@/features/finance';
import { VendorInventoryPage } from '@/features/inventory';
import { AdminVendorsPage } from '@/features/vendors';
import { AdminUsersPage } from '@/features/users';
import { VendorProductsPage } from '@/features/products';
import { VendorStaffPage } from '@/features/vendor-staff';
import { VendorShopProfilePage } from '@/features/vendor-shops';
import { ComingSoonPage } from '@/pages/coming-soon-page';
import { DashboardRoute, VendorOrderDetailRoute, VendorOrdersRoute } from './route-elements';

function RouterErrorElement() {
  return <RouteErrorPage error={useRouteError()} />;
}

/** Sidebar entries marked `soon` get a placeholder route automatically. */
const comingSoonRoutes: RouteObject[] = [
  ...flattenNav().filter((entry) => entry.soon),
  { to: ROUTES.SETTINGS, label: 'Account settings' },
  { to: ROUTES.SUPPORT, label: 'Help & support' },
].map((entry) => ({ path: entry.to, element: <ComingSoonPage title={entry.label} /> }));

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouterErrorElement />,
    children: [
      { path: ROUTES.LOGIN, element: <SignInPage /> },
      { path: ROUTES.LOGIN_VERIFY, element: <VerifyCodePage /> },
      { path: ROUTES.ACCEPT_INVITE, element: <AcceptInvitePage /> },
    ],
  },
  {
    path: ROUTES.DASHBOARD,
    element: <AdminLayout />,
    errorElement: <RouterErrorElement />,
    children: [
      { index: true, element: <DashboardRoute /> },
      { path: ROUTES.VENDOR_ORDERS, element: <VendorOrdersRoute /> },
      { path: ROUTES.VENDOR_ORDER_DETAIL, element: <VendorOrderDetailRoute /> },
      { path: ROUTES.VENDOR_SHOPS, element: <VendorShopProfilePage /> },
      { path: ROUTES.VENDOR_PRODUCTS, element: <VendorProductsPage /> },
      { path: ROUTES.VENDOR_STAFF, element: <VendorStaffPage /> },
      { path: ROUTES.VENDOR_INVENTORY, element: <VendorInventoryPage /> },
      { path: ROUTES.VENDOR_SETTLEMENTS, element: <VendorSettlementsPage /> },
      { path: ROUTES.DELIVERY_TASKS, element: <DeliveryTasksPage /> },
      { path: ROUTES.ADMIN_VENDORS, element: <AdminVendorsPage /> },
      { path: ROUTES.ADMIN_USERS, element: <AdminUsersPage /> },
      { path: ROUTES.ADMIN_FINANCE, element: <AdminFinancePage /> },
      { path: ROUTES.ADMIN_DISPUTES, element: <AdminDisputesPage /> },
      ...comingSoonRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
