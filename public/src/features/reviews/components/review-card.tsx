import { ShieldCheck, User } from 'lucide-react';
import { formatDateIST } from '@/utils';
import type { ReviewResponse } from '../api/reviews.api';
import { StarRating } from './star-rating';

interface ReviewCardProps {
  review: ReviewResponse;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted border border-border text-muted">
            <User className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-text block leading-tight">
              {review.customerName}
            </span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                <ShieldCheck className="h-3 w-3" /> Verified Order
              </span>
            )}
          </div>
        </div>

        <span className="text-[11px] text-muted font-mono">
          {formatDateIST(review.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {review.comment && (
        <p className="text-xs text-text/80 leading-relaxed pt-1">
          {review.comment}
        </p>
      )}
    </div>
  );
}
