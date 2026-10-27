import { useNavigate, useParams } from 'react-router-dom';
import { buildPath, ROUTES } from '@/config/routes';
import { VendorOrderDetailPage, VendorOrdersPage } from '@/features/orders';

// Adapters that connect callback-based pages to the router.

export function VendorOrdersRoute() {
  const navigate = useNavigate();
  return <VendorOrdersPage onSelectOrder={(orderId) => navigate(buildPath(ROUTES.VENDOR_ORDER_DETAIL, { orderId }))} />;
}

export function VendorOrderDetailRoute() {
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();
  return <VendorOrderDetailPage orderId={orderId} onBack={() => navigate(ROUTES.VENDOR_ORDERS)} />;
}
