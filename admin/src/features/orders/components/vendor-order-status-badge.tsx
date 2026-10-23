import { Badge, type BadgeProps } from '@/components/ui';

interface VendorOrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<string, { label: string; tone: BadgeProps['tone'] }> = {
  PLACED: { label: 'New Incoming', tone: 'warning' },
  ACCEPTED: { label: 'Accepted', tone: 'info' },
  PREPARING: { label: 'Cutting & Packing', tone: 'primary' },
  READY: { label: 'Ready for Pickup', tone: 'success' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', tone: 'info' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  REJECTED: { label: 'Rejected by Shop', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
};

export function VendorOrderStatusBadge({ status, size = 'md' }: VendorOrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, tone: 'neutral' };
  return (
    <Badge tone={config.tone} size={size} dot>
      {config.label}
    </Badge>
  );
}
