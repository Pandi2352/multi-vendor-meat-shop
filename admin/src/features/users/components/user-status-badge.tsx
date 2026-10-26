import { Badge } from '@/components/ui';
import type { InvitationStatus, UserStatus } from '../api/users.api';

interface UserStatusBadgeProps {
  status: UserStatus | InvitationStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  switch (status) {
    case 'ACTIVE':
    case 'ACCEPTED':
      return <Badge tone="success" dot>{status}</Badge>;
    case 'PENDING':
      return <Badge tone="warning" dot>PENDING</Badge>;
    case 'INACTIVE':
      return <Badge tone="warning">{status}</Badge>;
    case 'SUSPENDED':
    case 'REVOKED':
    case 'DELETED':
      return <Badge tone="danger">{status}</Badge>;
    case 'EXPIRED':
    default:
      return <Badge tone="neutral">{status}</Badge>;
  }
}
