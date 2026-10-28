import { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button, Alert, toast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api-error';
import { useOrderReview, useCreateReview } from '../api/use-reviews';
import { StarRating } from './star-rating';

interface OrderReviewFormProps {
  orderId: string;
  shopName: string;
}

export function OrderReviewForm({ orderId, shopName }: OrderReviewFormProps) {
  const { data: existingReview, isLoading } = useOrderReview(orderId);
  const createReview = useCreateReview();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isLoading) return null;

  if (existingReview) {
    return (
      <div className="rounded-md border border-success/30 bg-success-soft/20 p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>You rated this order ({existingReview.rating}/5 stars)</span>
          </div>
          <span className="text-[11px] text-muted font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified Purchase
          </span>
        </div>
        <div className="pt-1">
          <StarRating value={existingReview.rating} readOnly size="sm" />
        </div>
        {existingReview.comment && (
          <p className="text-xs text-text/80 italic pt-1">
            "{existingReview.comment}"
          </p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await createReview.mutateAsync({
        orderId,
        body: {
          rating,
          comment: comment.trim() || undefined,
        },
      });
      toast.success('Thank you for reviewing your meat order! Your feedback helps your local community.');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to submit review. Please try again.');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface p-4 sm:p-5 space-y-4">
      <div className="border-b border-border pb-3">
        <h4 className="text-sm font-bold text-text flex items-center gap-1.5">
          <Star className="h-4 w-4 text-warning fill-warning" />
          <span>Rate Your Fresh Meat Delivery</span>
        </h4>
        <p className="text-xs text-muted mt-0.5">
          How was the freshness and cutting quality from {shopName}?
        </p>
      </div>

      {errorMsg && <Alert tone="danger">{errorMsg}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            Star Rating *
          </label>
          <div className="flex items-center gap-3">
            <StarRating value={rating} onChange={setRating} size="md" />
            <span className="text-xs font-semibold text-warning">
              {rating === 5 && 'Outstanding Freshness'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Below Expectation'}
              {rating === 1 && 'Unsatisfactory'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text mb-1.5">
            Your Review (Optional)
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell your neighbors about the cut accuracy, chilling, and meat quality..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={createReview.isPending}
          className="w-full sm:w-auto"
        >
          Submit Verified Review
        </Button>
      </form>
    </div>
  );
}
