import type { Review } from '../schemas/review.schema.js';
import type { ReviewResponseDto } from '../dto/review-response.dto.js';

export const toReviewResponseDto = (review: Review): ReviewResponseDto => ({
  id: review._id,
  shopId: review.shopId,
  orderId: review.orderId,
  customerId: review.customerId,
  customerName: review.customerName,
  rating: review.rating,
  comment: review.comment,
  isVerifiedPurchase: review.isVerifiedPurchase,
  createdAt:
    review.createdAt instanceof Date ? review.createdAt.toISOString() : String(review.createdAt),
});
