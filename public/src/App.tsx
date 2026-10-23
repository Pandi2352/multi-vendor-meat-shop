import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ShoppingBag, MapPin, Store, Package } from 'lucide-react';
import { Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/layout';
import { queryClient } from '@/lib/query-client';
import { useCart } from '@/features/cart/api/use-cart';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { CheckoutModal } from '@/features/orders/components/checkout-modal';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';
import type { CheckoutQuoteResponse } from '@/features/cart/api/cart.api';

function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { data: cart } = useCart();
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
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface-muted text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Chennai, TN</span>
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

function HomePage({ onOpenCart }: { onOpenCart: () => void }) {
  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      <section className="rounded-md border border-border bg-surface p-6 sm:p-10 mb-8">
        <div className="max-w-2xl">
          <span className="inline-block px-2.5 py-1 mb-3 rounded-md border border-border bg-surface-muted text-xs font-medium text-primary">
            Hyperlocal Fresh Meat Delivery
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mb-3">
            Fresh cut meat delivered directly from trusted local butchers
          </h2>
          <p className="text-sm text-muted mb-6">
            Exact weight ordering in grams, zero hidden charges, transparent pricing in paise, and lightning-fast delivery across Tamil Nadu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" leftIcon={<Store className="h-4 w-4" />} onClick={onOpenCart}>
              View Cart / Order Now
            </Button>
            <Link to="/orders">
              <Button variant="outline">Track Existing Orders</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section>
        <h3 className="text-lg font-semibold text-text mb-4">Popular Fresh Cuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Country Chicken', count: '12 shops', tag: 'Fresh daily' },
            { name: 'Broiler Chicken', count: '18 shops', tag: 'Clean cut' },
            { name: 'Goat / Mutton', count: '9 shops', tag: 'Tender' },
            { name: 'Fresh Fish', count: '14 shops', tag: 'Catch of the day' },
          ].map((cat) => (
            <div
              key={cat.name}
              onClick={onOpenCart}
              className="rounded-md border border-border bg-surface p-4 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <p className="font-semibold text-text text-sm mb-1">{cat.name}</p>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{cat.count}</span>
                <span className="text-primary">{cat.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
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
          <StorefrontApp />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
