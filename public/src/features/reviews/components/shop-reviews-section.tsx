import { Star, MessageSquare } from 'lucide-react';
import { EmptyState, Spinner } from '@/components/ui';
import { useShopRatingSummary, useShopReviews } from '../api/use-reviews';
import { StarRating } from './star-rating';
import { ReviewCard } from './review-card';

interface ShopReviewsSectionProps {
  shopId: string;
  shopName: string;
}

export function ShopReviewsSection({ shopId, shopName }: ShopReviewsSectionProps) {
  const { data: summary, isLoading: isSummaryLoading } = useShopRatingSummary(shopId);
  const { data: reviewsData, isLoading: isReviewsLoading } = useShopReviews(shopId, { limit: 10 });

  if (isSummaryLoading || isReviewsLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const reviews = reviewsData?.items ?? [];
  const total = summary?.totalReviews ?? 0;
  const avg = summary?.averageRating ?? 0;
  const dist = summary?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span>Customer Reviews & Ratings for {shopName}</span>
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Real feedback from verified neighbourhood meat buyers
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description={`Be the first customer to order fresh cuts from ${shopName} and share your review!`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Summary Score Card */}
          <div className="rounded-md border border-border bg-surface p-5 flex flex-col justify-center items-center text-center space-y-2">
            <span className="text-4xl font-extrabold text-text font-mono">
              {avg.toFixed(1)}
            </span>
            <StarRating value={Math.round(avg)} readOnly size="md" />
            <span className="text-xs text-muted font-medium">
              Based on {total} verified {total === 1 ? 'order' : 'orders'}
            </span>

            {/* Distribution bars */}
            <div className="w-full pt-3 space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = dist[star as 1 | 2 | 3 | 4 | 5] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-muted">
                    <span className="w-3 text-right font-mono text-[11px]">{star}★</span>
                    <div className="flex-1 h-2 bg-surface-muted border border-border rounded-md overflow-hidden">
                      <div
                        className="h-full bg-warning transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-[10px]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-3">
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
