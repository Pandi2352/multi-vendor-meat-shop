import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary, StorefrontHeader, StorefrontFooter } from '@/components/layout';
import { queryClient } from '@/lib/query-client';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { CheckoutModal } from '@/features/orders/components/checkout-modal';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';
import { ShopCataloguePage } from '@/features/shops/pages/shop-catalogue-page';
import { HomePage } from '@/pages/home-page';
import { DistrictProvider } from '@/context/district-context';
import { VendorApplyModal } from '@/features/vendors';
import type { CheckoutQuoteResponse } from '@/features/cart/api/cart.api';

function StorefrontApp() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuoteResponse | null>(null);

  const handleOrderPlaced = (order: { id: string }) => {
    setCheckoutQuote(null);
    setIsCartOpen(false);
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StorefrontHeader
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
      />

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

      <VendorApplyModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {checkoutQuote && (
        <CheckoutModal
          isOpen={Boolean(checkoutQuote)}
          quote={checkoutQuote}
          onClose={() => setCheckoutQuote(null)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      <StorefrontFooter onOpenPartnerModal={() => setIsPartnerModalOpen(true)} />
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
