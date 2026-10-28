import { X, ShoppingBag, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR, formatWeight } from '@/utils';
import { useDistrict } from '@/context/district-context';
import { useCart, useCheckoutQuote, useClearCart, useRemoveCartItem } from '../api/use-cart';
import type { CheckoutQuoteResponse } from '../api/cart.api';
import { CartItemRow } from './cart-item-row';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (quote: CheckoutQuoteResponse) => void;
}

export function CartDrawer({ isOpen, onClose, onProceedToCheckout }: CartDrawerProps) {
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const { selectedTown } = useDistrict();

  const hasItems = cart && cart.items && cart.items.length > 0;
  const { data: quote } = useCheckoutQuote(
    selectedTown?.lat ?? 9.568,
    selectedTown?.lng ?? 77.9624,
    undefined,
    Boolean(hasItems),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex justify-end">
      <div className="w-full max-w-md bg-surface border-l border-border h-full flex flex-col p-5 sm:p-6 overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-text">Your Meat Cart</h3>
            {cart && cart.itemCount > 0 && (
              <span className="text-xs text-muted">({cart.itemCount} items)</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-text hover:bg-surface-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted text-center py-10">Loading your cart...</p>
          ) : !hasItems ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-10 w-10 text-muted mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm text-text">Your cart is empty</p>
              <p className="text-xs text-muted mt-1">Browse fresh cuts from nearby butchers</p>
            </div>
          ) : (
            <>
              {cart.shopName && (
                <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-xs flex justify-between items-center">
                  <span className="font-medium text-text">Shop: {cart.shopName}</span>
                  <button
                    type="button"
                    onClick={() => clearCart.mutate()}
                    className="text-muted hover:text-danger text-[11px] underline"
                  >
                    Clear cart
                  </button>
                </div>
              )}

              {cart.items.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  onRemove={(id) => removeItem.mutate(id)}
                />
              ))}
            </>
          )}
        </div>

        {/* Drawer Footer / Quote */}
        {hasItems && quote && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted">
                <span>Total Weight</span>
                <span>{formatWeight(quote.totalWeightGrams)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatINR(quote.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Thermal Chilled Packaging</span>
                <span>{formatINR(quote.packagingFeePaise)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span>{quote.deliveryFeePaise === 0 ? 'FREE' : formatINR(quote.deliveryFeePaise)}</span>
              </div>
              {quote.discountPaise > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Discount</span>
                  <span>-{formatINR(quote.discountPaise)}</span>
                </div>
              )}
              <div className="border-t border-border pt-1 flex justify-between font-bold text-sm text-text">
                <span>Estimated Total</span>
                <span className="text-primary">{formatINR(quote.totalPaise)}</span>
              </div>
            </div>

            {!quote.minOrderMet && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Min order for this shop is {formatINR(quote.minOrderPaise)}
              </p>
            )}

            <Button
              variant="primary"
              fullWidth
              disabled={!quote.minOrderMet}
              onClick={() => {
                onClose();
                onProceedToCheckout(quote);
              }}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
