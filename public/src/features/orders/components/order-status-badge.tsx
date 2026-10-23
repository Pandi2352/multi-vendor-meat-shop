import { Badge } from '@/components/ui';

export type OrderStatusType =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'RESOLVED';

interface OrderStatusBadgeProps {
  status: OrderStatusType | string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<string, { label: string; tone: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDING_PAYMENT: { label: 'Payment Pending', tone: 'warning' },
  PLACED: { label: 'Order Placed', tone: 'info' },
  ACCEPTED: { label: 'Accepted by Butcher', tone: 'info' },
  PREPARING: { label: 'Cutting & Packing', tone: 'warning' },
  READY: { label: 'Ready for Dispatch', tone: 'info' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', tone: 'primary' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  REJECTED: { label: 'Declined by Shop', tone: 'danger' },
  REFUND_PENDING: { label: 'Refund Processing', tone: 'warning' },
  REFUNDED: { label: 'Refunded', tone: 'success' },
  DISPUTED: { label: 'In Dispute', tone: 'danger' },
  RESOLVED: { label: 'Resolved', tone: 'success' },
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, tone: 'neutral' };

  return (
    <Badge tone={config.tone} size={size} dot>
      {config.label}
    </Badge>
  );
}
