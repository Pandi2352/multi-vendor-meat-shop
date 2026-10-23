import { createStateMachine } from '#common/utils';
import { ProductStatus } from '#common/enums';

export const PRODUCT_STATUS_MACHINE = createStateMachine<ProductStatus>('ProductStatus', [
  { from: ProductStatus.DRAFT, to: ProductStatus.PENDING_REVIEW },
  { from: ProductStatus.DRAFT, to: ProductStatus.ACTIVE },
  { from: ProductStatus.DRAFT, to: ProductStatus.ARCHIVED },
  { from: ProductStatus.PENDING_REVIEW, to: ProductStatus.ACTIVE },
  { from: ProductStatus.PENDING_REVIEW, to: ProductStatus.DRAFT },
  { from: ProductStatus.PENDING_REVIEW, to: ProductStatus.ARCHIVED },
  { from: ProductStatus.ACTIVE, to: ProductStatus.INACTIVE },
  { from: ProductStatus.ACTIVE, to: ProductStatus.ARCHIVED },
  { from: ProductStatus.INACTIVE, to: ProductStatus.ACTIVE },
  { from: ProductStatus.INACTIVE, to: ProductStatus.ARCHIVED },
]);
