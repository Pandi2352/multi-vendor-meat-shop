import { Badge } from '@/components/ui';
import type { UserRole } from '../api/users.api';

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  switch (role) {
    case 'SUPER_ADMIN':
      return <Badge tone="primary" dot>Super Admin</Badge>;
    case 'ADMIN':
      return <Badge tone="primary">Admin</Badge>;
    case 'OPERATIONS':
      return <Badge tone="info">Operations</Badge>;
    case 'FINANCE':
      return <Badge tone="warning">Finance</Badge>;
    case 'SUPPORT':
      return <Badge tone="info">Support</Badge>;
    case 'VENDOR_OWNER':
      return <Badge tone="success" dot>Stall Owner</Badge>;
    case 'VENDOR_STAFF':
      return <Badge tone="success">Stall Staff</Badge>;
    case 'DELIVERY_PARTNER':
      return <Badge tone="neutral">Delivery</Badge>;
    case 'CUSTOMER':
    default:
      return <Badge tone="neutral">Customer</Badge>;
  }
}
