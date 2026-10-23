import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ShoppingBag, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/layout';
import { queryClient } from '@/lib/query-client';
import { useCart } from '@/features/cart/api/use-cart';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { CheckoutModal } from '@/features/orders/components/checkout-modal';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';
import { ShopCataloguePage } from '@/features/shops/pages/shop-catalogue-page';
import { HomePage } from '@/pages/home-page';
import { DistrictProvider, useDistrict } from '@/context/district-context';
import { TN_DISTRICTS } from '@/constants/tn-districts';
import type { CheckoutQuoteResponse } from '@/features/cart/api/cart.api';

function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { data: cart } = useCart();
  const { selectedDistrict, setSelectedDistrict } = useDistrict();
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            TN
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-text">Tamil Nadu Meat Shop</h1>
            <p className="text-xs text-muted">Fresh & Hyperlocal Marketplace</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* 38 Tamil Nadu Districts Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-muted text-xs">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text focus:outline-none cursor-pointer pr-1"
              aria-label="Select Tamil Nadu District"
            >
              {TN_DISTRICTS.map((d) => (
                <option key={d.code} value={d.nameEn} className="bg-surface text-text">
                  {d.nameEn} ({d.nameTa})
                </option>
              ))}
            </select>
          </div>

          <Link to="/orders">
            <Button variant="outline" size="sm" leftIcon={<Package className="h-4 w-4" />}>
              Orders
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCart}
            leftIcon={<ShoppingBag className="h-4 w-4" />}
          >
            Cart ({itemCount})
          </Button>
        </div>
      </div>
    </header>
  );
}

function StorefrontApp() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuoteResponse | null>(null);

  const handleOrderPlaced = (order: { id: string }) => {
    setCheckoutQuote(null);
    setIsCartOpen(false);
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onOpenCart={() => setIsCartOpen(true)} />

      <Routes>
        <Route path="/" element={<HomePage onOpenCart={() => setIsCartOpen(true)} />} />
        <Route path="/shops/:shopId" element={<ShopCataloguePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={(quote) => {
          setIsCartOpen(false);
          setCheckoutQuote(quote);
        }}
      />

      {checkoutQuote && (
        <CheckoutModal
          isOpen={Boolean(checkoutQuote)}
          quote={checkoutQuote}
          onClose={() => setCheckoutQuote(null)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      <footer className="border-t border-border bg-surface mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© 2026 Tamil Nadu Meat Marketplace. All rights reserved.</p>
          <p>Made for Tamil Nadu with clean meat standards & FSSAI compliance.</p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DistrictProvider>
            <StorefrontApp />
          </DistrictProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
