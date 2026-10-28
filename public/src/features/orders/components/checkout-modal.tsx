import { useState } from 'react';
import { X, Truck, ShieldCheck } from 'lucide-react';
import { Button, Alert, toast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api-error';
import { formatINR } from '@/utils';
import type { CheckoutQuoteResponse } from '@/features/cart/api/cart.api';
import { useCheckoutQuote } from '@/features/cart/api/use-cart';
import { CouponInput } from '@/features/coupons';
import { AddressSelector, type SelectedAddressData } from '@/features/addresses';
import { useCreateOrder } from '../api/use-orders';
import type { OrderResponse } from '../api/orders.api';
import { CheckoutBillBreakdown } from './checkout-bill-breakdown';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: CheckoutQuoteResponse;
  onOrderPlaced: (order: OrderResponse) => void;
}

export function CheckoutModal({ isOpen, onClose, quote: initialQuote, onOrderPlaced }: CheckoutModalProps) {
  const createOrder = useCreateOrder();
  const [addressData, setAddressData] = useState<SelectedAddressData>({
    text: '15 Madurai Road, Virudhunagar Town',
    pincode: '626001',
    district: 'Virudhunagar',
    label: 'Home',
    location: { lat: 9.568, lng: 77.9624 },
  });
  const [customerNotes, setCustomerNotes] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPaise: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: dynamicQuote } = useCheckoutQuote(
    addressData.location?.lat,
    addressData.location?.lng,
    appliedCoupon?.code,
    Boolean(isOpen && appliedCoupon),
  );

  const effectiveQuote = dynamicQuote ?? initialQuote;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (addressData.text.trim().length < 5) {
      const msg = 'Please provide a complete delivery address';
      setError(msg);
      toast.warning(msg);
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        deliveryAddress: {
          text: addressData.text.trim(),
          pincode: addressData.pincode.trim(),
          district: addressData.district.trim(),
          location: addressData.location || { lat: 9.568, lng: 77.9624 },
          label: addressData.label || 'Home',
        },
        customerNotes: customerNotes.trim() || undefined,
        couponCode: appliedCoupon?.code,
        paymentMethod: 'COD',
      });
      toast.success('Order placed successfully! Butcher stall has been notified.');
      onOrderPlaced(order);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to place order. Please try again.');
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-md border border-border bg-surface p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted hover:text-text hover:bg-surface-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-text">Checkout & Confirm Order</h3>
          <p className="text-xs text-muted">Shop: {effectiveQuote.shopName}</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AddressSelector
            selectedAddress={addressData}
            onSelect={(addr) => setAddressData(addr)}
          />

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Delivery Notes (Optional)</label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. Ring bell, leave with security"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">Coupons & Offers</label>
            <CouponInput
              subtotalPaise={effectiveQuote.subtotalPaise}
              shopId={effectiveQuote.shopId}
              appliedCoupon={appliedCoupon}
              onApply={(c) => {
                setAppliedCoupon(c);
                toast.success(`Coupon ${c.code} applied! Saved ${formatINR(c.discountPaise)}`);
              }}
              onRemove={() => {
                setAppliedCoupon(null);
                toast.info('Coupon removed');
              }}
            />
          </div>

          <CheckoutBillBreakdown quote={effectiveQuote} couponCode={appliedCoupon?.code} />

          <div className="rounded-md border border-border bg-surface p-2.5 flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" />
            <span>Pay securely via Cash on Delivery once your chilled meat arrives.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={createOrder.isPending}
              leftIcon={<Truck className="h-4 w-4" />}
            >
              Confirm Order ({formatINR(effectiveQuote.totalPaise)})
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
