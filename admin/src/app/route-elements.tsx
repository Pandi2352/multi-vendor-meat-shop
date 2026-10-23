import { useNavigate, useParams } from 'react-router-dom';
import { buildPath, ROUTES } from '@/config/routes';
import { VendorOrderDetailPage, VendorOrdersPage } from '@/features/orders';
import { DashboardPage } from '@/pages/dashboard-page';

// Adapters that connect callback-based pages to the router.

export function DashboardRoute() {
  const navigate = useNavigate();
  return (
    <DashboardPage
      onOpenVendorOrders={() => navigate(ROUTES.VENDOR_ORDERS)}
      onOpenDelivery={() => navigate(ROUTES.DELIVERY_TASKS)}
      onOpenInventory={() => navigate(ROUTES.VENDOR_INVENTORY)}
      onOpenSettlements={() => navigate(ROUTES.VENDOR_SETTLEMENTS)}
    />
  );
}

export function VendorOrdersRoute() {
  const navigate = useNavigate();
  return <VendorOrdersPage onSelectOrder={(orderId) => navigate(buildPath(ROUTES.VENDOR_ORDER_DETAIL, { orderId }))} />;
}

export function VendorOrderDetailRoute() {
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();
  return <VendorOrderDetailPage orderId={orderId} onBack={() => navigate(ROUTES.VENDOR_ORDERS)} />;
}
