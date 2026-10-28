import { formatINR, formatWeight } from '@/utils';
import type { CheckoutQuoteResponse } from '@/features/cart/api/cart.api';

interface CheckoutBillBreakdownProps {
  quote: CheckoutQuoteResponse;
  couponCode?: string;
}

export function CheckoutBillBreakdown({ quote, couponCode }: CheckoutBillBreakdownProps) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3 space-y-1.5 text-xs">
      <div className="flex justify-between text-muted">
        <span>Fresh Meat ({formatWeight(quote.totalWeightGrams)})</span>
        <span>{formatINR(quote.subtotalPaise)}</span>
      </div>
      <div className="flex justify-between text-muted">
        <span>Chilled Thermal Pouch</span>
        <span>{formatINR(quote.packagingFeePaise)}</span>
      </div>
      <div className="flex justify-between text-muted">
        <span>Delivery Partner Fee</span>
        <span>{quote.deliveryFeePaise === 0 ? 'FREE' : formatINR(quote.deliveryFeePaise)}</span>
      </div>
      {quote.discountPaise > 0 && (
        <div className="flex justify-between text-success font-medium">
          <span>Promo Savings ({(quote as { couponCode?: string }).couponCode || couponCode})</span>
          <span>-{formatINR(quote.discountPaise)}</span>
        </div>
      )}
      <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm text-text">
        <span>Total Payable (Cash on Delivery)</span>
        <span className="text-primary">{formatINR(quote.totalPaise)}</span>
      </div>
    </div>
  );
}
