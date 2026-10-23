import { createBrowserRouter, useRouteError, type RouteObject } from 'react-router-dom';
import { AdminLayout, NotFoundPage, RouteErrorPage } from '@/components/layout';
import { flattenNav } from '@/config/nav.utils';
import { ROUTES } from '@/config/routes';
import { DeliveryTasksPage } from '@/features/delivery';
import { VendorSettlementsPage } from '@/features/finance';
import { VendorInventoryPage } from '@/features/inventory';
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
  { path: ROUTES.LOGIN, element: <ComingSoonPage title="Admin sign-in" /> },
  {
    path: ROUTES.DASHBOARD,
    element: <AdminLayout />,
    errorElement: <RouterErrorElement />,
    children: [
      { index: true, element: <DashboardRoute /> },
      { path: ROUTES.VENDOR_ORDERS, element: <VendorOrdersRoute /> },
      { path: ROUTES.VENDOR_ORDER_DETAIL, element: <VendorOrderDetailRoute /> },
      { path: ROUTES.VENDOR_INVENTORY, element: <VendorInventoryPage /> },
      { path: ROUTES.VENDOR_SETTLEMENTS, element: <VendorSettlementsPage /> },
      { path: ROUTES.DELIVERY_TASKS, element: <DeliveryTasksPage /> },
      ...comingSoonRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
