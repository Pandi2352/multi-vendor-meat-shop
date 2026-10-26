import { Badge } from '@/components/ui';
import type { ProductStatus } from '../api';

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  switch (status) {
    case 'ACTIVE':
      return <Badge tone="success" dot>In Stock</Badge>;
    case 'INACTIVE':
      return <Badge tone="warning" dot>Out of Stock</Badge>;
    case 'ARCHIVED':
      return <Badge tone="neutral">Archived</Badge>;
    case 'DRAFT':
    default:
      return <Badge tone="neutral">Draft</Badge>;
  }
}
