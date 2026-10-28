import { useState } from 'react';
import { Tag, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui';
import { getErrorMessage } from '@/lib/api-error';
import { formatINR } from '@/utils';
import { useApplyCoupon, useAvailableCoupons } from '../api/use-coupons';

interface CouponInputProps {
  subtotalPaise: number;
  shopId?: string;
  appliedCoupon?: { code: string; discountPaise: number } | null;
  onApply: (applied: { code: string; discountPaise: number }) => void;
  onRemove: () => void;
}

export function CouponInput({
  subtotalPaise,
  shopId,
  appliedCoupon,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);

  const applyMutation = useApplyCoupon();
  const { data: availableCoupons = [] } = useAvailableCoupons(shopId);

  const handleApply = async (codeToApply: string) => {
    const trimmed = codeToApply.trim().toUpperCase();
    if (!trimmed) return;
    setError(null);

    try {
      const res = await applyMutation.mutateAsync({
        code: trimmed,
        subtotalPaise,
        shopId,
      });
      onApply({ code: res.code, discountPaise: res.discountPaise });
      setInputCode('');
      setShowOffers(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to apply coupon'));
    }
  };

  if (appliedCoupon) {
    return (
      <div className="rounded-md border border-success/40 bg-success/10 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-success/20 text-success flex items-center justify-center">
            <Check className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-success font-mono uppercase tracking-wide">
                {appliedCoupon.code}
              </span>
              <span className="text-[10px] rounded-md bg-success text-surface px-1.5 py-0.2 font-semibold">
                APPLIED
              </span>
            </div>
            <p className="text-[11px] text-success font-medium">
              You saved {formatINR(appliedCoupon.discountPaise)} on this order!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-md text-muted hover:text-danger hover:bg-surface transition-colors"
          title="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="PROMO CODE"
            className="w-full rounded-md border border-border bg-surface pl-9 pr-3 py-1.5 text-xs font-mono uppercase text-text placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!inputCode.trim()}
          loading={applyMutation.isPending}
          onClick={() => handleApply(inputCode)}
        >
          Apply
        </Button>
      </div>

      {error && <p className="text-[11px] text-danger font-medium">{error}</p>}

      {availableCoupons.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowOffers((prev) => !prev)}
            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>{showOffers ? 'Hide offers' : `View ${availableCoupons.length} available offers`}</span>
            {showOffers ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showOffers && (
            <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
              {availableCoupons.map((coupon) => {
                const eligible = subtotalPaise >= coupon.minOrderPaise;
                return (
                  <div
                    key={coupon.id}
                    className="rounded-md border border-border bg-surface-muted p-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-text bg-surface px-1.5 py-0.5 rounded-md border border-border">
                        {coupon.code}
                      </span>
                      <p className="text-[11px] text-muted mt-0.5">{coupon.description}</p>
                      {!eligible && (
                        <p className="text-[10px] text-warning">
                          Add {formatINR(coupon.minOrderPaise - subtotalPaise)} more to unlock
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!eligible || applyMutation.isPending}
                      onClick={() => handleApply(coupon.code)}
                    >
                      Apply
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
