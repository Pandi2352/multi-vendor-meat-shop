import { useMemo, useState } from 'react';
import { Layers, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatWeight } from '@/utils/format';
import type { Product } from '../api/inventory.api';
import {
  useAdjustStock,
  useSetOpeningStock,
  useTodayInventory,
  useVendorProducts,
} from '../api/use-inventory';
import { InventoryProductCard } from '../components/inventory-product-card';
import { OpeningStockModal } from '../components/opening-stock-modal';
import { StockAdjustmentModal } from '../components/stock-adjustment-modal';
import { StockMovementsDrawer } from '../components/stock-movements-drawer';
import { ShopSwitcher } from '@/features/vendor-shops';

export function VendorInventoryPage() {
  const [search, setSearch] = useState('');
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [movementsProductId, setMovementsProductId] = useState<string | null>(null);
  const [selectedProductForOpening, setSelectedProductForOpening] = useState<string | undefined>();

  const { data: todayBatches = [], isLoading: isLoadingBatches, refetch: refetchBatches } = useTodayInventory();
  const { data: productsData, isLoading: isLoadingProducts } = useVendorProducts();
  const setOpeningMutation = useSetOpeningStock();
  const adjustMutation = useAdjustStock();

  const products: Product[] = productsData?.items ?? [];

  const batchByProductId = useMemo(() => {
    const map = new Map<string, typeof todayBatches[0]>();
    for (const b of todayBatches) {
      map.set(b.productId, b);
    }
    return map;
  }, [todayBatches]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sellMode.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  const totals = useMemo(() => {
    let opening = 0;
    let available = 0;
    let reserved = 0;
    let dispatched = 0;
    for (const b of todayBatches) {
      opening += b.totalOpeningGrams;
      available += b.availableGrams;
      reserved += b.reservedGrams;
      dispatched += Math.max(0, b.totalOpeningGrams - b.availableGrams);
    }
    return { opening, available, reserved, dispatched };
  }, [todayBatches]);

  const activeAdjustProduct = products.find((p: Product) => p.id === adjustProductId);
  const activeMovementsProduct = products.find((p: Product) => p.id === movementsProductId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Daily Stock Ledger
          </h1>
          <p className="text-xs text-muted mt-1">
            Opening stock weights, midday trimming adjustments, and live cut inventory in grams.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShopSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchBatches()}
            loading={isLoadingBatches}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedProductForOpening(undefined);
              setOpeningModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Set Opening Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Morning Opening Stock</span>
          <span className="text-lg font-bold text-text">{formatWeight(totals.opening)}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Live Fresh Available</span>
          <span className="text-lg font-bold text-emerald-500">{formatWeight(totals.available)}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Reserved / Packing</span>
          <span className="text-lg font-bold text-amber-500">{formatWeight(totals.reserved)}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Dispatched (COD Orders)</span>
          <span className="text-lg font-bold text-text">{formatWeight(totals.dispatched)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search cuts (e.g., Curry cut, Boneless)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {isLoadingBatches || isLoadingProducts ? (
        <div className="text-center py-12 text-xs text-muted">Loading fresh cut batches...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 rounded-md border border-dashed border-border bg-surface text-xs text-muted">
          No meat products found. Please add products to your catalog first.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product: Product) => (
            <InventoryProductCard
              key={product.id}
              product={product}
              batch={batchByProductId.get(product.id)}
              onSetOpening={(pid) => {
                setSelectedProductForOpening(pid);
                setOpeningModalOpen(true);
              }}
              onAdjust={(pid) => setAdjustProductId(pid)}
              onViewMovements={(pid) => setMovementsProductId(pid)}
            />
          ))}
        </div>
      )}

      <OpeningStockModal
        isOpen={openingModalOpen}
        onClose={() => setOpeningModalOpen(false)}
        products={products}
        selectedProductId={selectedProductForOpening}
        onSetStock={async (data) => {
          await setOpeningMutation.mutateAsync(data);
        }}
        isSubmitting={setOpeningMutation.isPending}
      />

      {activeAdjustProduct ? (
        <StockAdjustmentModal
          isOpen={Boolean(adjustProductId)}
          onClose={() => setAdjustProductId(null)}
          productId={activeAdjustProduct.id}
          productName={activeAdjustProduct.name}
          onAdjust={async (data) => {
            await adjustMutation.mutateAsync(data);
          }}
          isSubmitting={adjustMutation.isPending}
        />
      ) : null}

      {movementsProductId ? (
        <StockMovementsDrawer
          isOpen={Boolean(movementsProductId)}
          onClose={() => setMovementsProductId(null)}
          productId={movementsProductId}
          productName={activeMovementsProduct?.name || 'Meat Cut'}
        />
      ) : null}
    </div>
  );
}
