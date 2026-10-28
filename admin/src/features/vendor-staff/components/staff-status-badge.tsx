import { Badge, type BadgeProps } from '@/components/ui';
import type { VendorStaffMember } from '../api';

const STATUS: Partial<Record<VendorStaffMember['status'], { label: string; tone: BadgeProps['tone'] }>> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  SUSPENDED: { label: 'Suspended', tone: 'warning' },
};

export function StaffStatusBadge({ status }: { status: VendorStaffMember['status'] }) {
  const config = STATUS[status] ?? { label: status, tone: 'neutral' };
  return (
    <Badge tone={config.tone} size="sm" dot>
      {config.label}
    </Badge>
  );
}
