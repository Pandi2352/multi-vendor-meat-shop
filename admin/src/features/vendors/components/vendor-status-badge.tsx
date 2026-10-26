import { Badge } from '@/components/ui';
import type { VendorStatus } from '../api/vendors.api';

interface VendorStatusBadgeProps {
  status: VendorStatus;
}

export function VendorStatusBadge({ status }: VendorStatusBadgeProps) {
  switch (status) {
    case 'APPROVED':
      return <Badge tone="success" dot>Approved</Badge>;
    case 'SUBMITTED':
      return <Badge tone="warning" dot>Pending Review</Badge>;
    case 'UNDER_REVIEW':
      return <Badge tone="info" dot>Under Review</Badge>;
    case 'RESUBMISSION_REQUIRED':
      return <Badge tone="warning" dot>Changes Requested</Badge>;
    case 'REJECTED':
      return <Badge tone="danger" dot>Rejected</Badge>;
    case 'SUSPENDED':
      return <Badge tone="danger" dot>Suspended</Badge>;
    case 'DRAFT':
    default:
      return <Badge tone="neutral">Draft</Badge>;
  }
}
