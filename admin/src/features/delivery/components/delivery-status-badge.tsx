import { Badge, type BadgeProps } from '@/components/ui';

interface DeliveryStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<string, { label: string; tone: BadgeProps['tone'] }> = {
  UNASSIGNED: { label: 'Awaiting Courier', tone: 'warning' },
  ASSIGNED: { label: 'Rider Assigned', tone: 'info' },
  PICKED_UP: { label: 'In Transit', tone: 'primary' },
  DELIVERED: { label: 'Delivered (COD Paid)', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
  RETURNED: { label: 'Returned to Shop', tone: 'neutral' },
};

export function DeliveryStatusBadge({ status, size = 'md' }: DeliveryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, tone: 'neutral' };
  return (
    <Badge tone={config.tone} size={size} dot>
      {config.label}
    </Badge>
  );
}
