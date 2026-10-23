import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { CircleDollarSign, Flame, LayoutDashboard, Truck } from 'lucide-react';
import { Button } from '@/components/ui';
import { ErrorBoundary } from '@/components/layout';
import { queryClient } from '@/lib/query-client';
import { DashboardPage } from './pages/dashboard-page';
import { VendorOrdersPage, VendorOrderDetailPage } from './features/orders';
import { DeliveryTasksPage } from './features/delivery';
import { VendorInventoryPage } from './features/inventory';
import { VendorSettlementsPage } from './features/finance';

type AppView =
  | 'DASHBOARD'
  | 'VENDOR_ORDERS'
  | 'ORDER_DETAIL'
  | 'DELIVERY_FLEET'
  | 'VENDOR_INVENTORY'
  | 'VENDOR_SETTLEMENTS';

export function App() {
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleOpenOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setView('ORDER_DETAIL');
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Top Header */}
          <header className="border-b border-border bg-surface sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('DASHBOARD')}>
                <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  VNR
                </div>
                <div>
                  <h1 className="text-sm font-semibold leading-tight text-text">
                    Virudhunagar Meat Marketplace — Operations Portal
                  </h1>
                  <p className="text-xs text-muted">Virudhunagar District • Vendor Hub • Delivery Fleet</p>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant={view === 'DASHBOARD' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setView('DASHBOARD')}
                  leftIcon={<LayoutDashboard className="h-4 w-4" />}
                >
                  Overview
                </Button>
                <Button
                  variant={view === 'VENDOR_ORDERS' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('VENDOR_ORDERS')}
                  leftIcon={<Flame className="h-4 w-4" />}
                >
                  Live Prep Queue
                </Button>
                <Button
                  variant={view === 'VENDOR_INVENTORY' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('VENDOR_INVENTORY')}
                  leftIcon={<LayoutDashboard className="h-4 w-4" />}
                >
                  Stock Ledger
                </Button>
                <Button
                  variant={view === 'DELIVERY_FLEET' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('DELIVERY_FLEET')}
                  leftIcon={<Truck className="h-4 w-4" />}
                >
                  Delivery Fleet
                </Button>
                <Button
                  variant={view === 'VENDOR_SETTLEMENTS' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setView('VENDOR_SETTLEMENTS')}
                  leftIcon={<CircleDollarSign className="h-4 w-4" />}
                >
                  Settlements
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content Workspace */}
          <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
            {view === 'DASHBOARD' && (
              <DashboardPage
                onOpenVendorOrders={() => setView('VENDOR_ORDERS')}
                onOpenDelivery={() => setView('DELIVERY_FLEET')}
                onOpenInventory={() => setView('VENDOR_INVENTORY')}
                onOpenSettlements={() => setView('VENDOR_SETTLEMENTS')}
              />
            )}

            {view === 'VENDOR_ORDERS' && (
              <VendorOrdersPage onSelectOrder={handleOpenOrderDetail} />
            )}

            {view === 'VENDOR_INVENTORY' && (
              <VendorInventoryPage />
            )}

            {view === 'VENDOR_SETTLEMENTS' && (
              <VendorSettlementsPage />
            )}

            {view === 'ORDER_DETAIL' && selectedOrderId && (
              <VendorOrderDetailPage
                orderId={selectedOrderId}
                onBack={() => setView('VENDOR_ORDERS')}
              />
            )}

            {view === 'DELIVERY_FLEET' && (
              <DeliveryTasksPage />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-surface py-5 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
              <p>© 2026 Virudhunagar Meat Marketplace — Operations Hub</p>
              <p>Virudhunagar • Sivakasi • Rajapalayam • Aruppukkottai • Srivilliputhur</p>
            </div>
          </footer>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
