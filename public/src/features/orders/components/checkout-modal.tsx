import { useState } from 'react';
import { X, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR, formatWeight } from '@/utils';
import type { CheckoutQuoteResponse } from '@/features/cart/api/cart.api';
import { useCreateOrder } from '../api/use-orders';
import type { OrderResponse } from '../api/orders.api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: CheckoutQuoteResponse;
  onOrderPlaced: (order: OrderResponse) => void;
}

export function CheckoutModal({ isOpen, onClose, quote, onOrderPlaced }: CheckoutModalProps) {
  const createOrder = useCreateOrder();
  const [addressText, setAddressText] = useState('12 Gandhi Road, T. Nagar');
  const [pincode, setPincode] = useState('600017');
  const [district, setDistrict] = useState('Chennai');
  const [customerNotes, setCustomerNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (addressText.trim().length < 5) {
      setError('Please provide a complete delivery address');
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        deliveryAddress: {
          text: addressText.trim(),
          pincode: pincode.trim(),
          district: district.trim(),
          location: { lat: 13.0418, lng: 80.2341 },
          label: 'Home',
        },
        customerNotes: customerNotes.trim() || undefined,
        paymentMethod: 'COD',
      });
      onOrderPlaced(order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      setError(msg);
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
          <p className="text-xs text-muted">Shop: {quote.shopName}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Delivery Address (Street, Building, Flat)
            </label>
            <input
              type="text"
              required
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. Flat 3A, 42 Anna Salai"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">District / City</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

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

          {/* Bill breakdown */}
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
            <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm text-text">
              <span>Total Payable (Cash on Delivery)</span>
              <span className="text-primary">{formatINR(quote.totalPaise)}</span>
            </div>
          </div>

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
              Confirm Order ({formatINR(quote.totalPaise)})
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
