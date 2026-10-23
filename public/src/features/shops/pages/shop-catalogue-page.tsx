import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, MapPin, Clock, Truck, ShieldCheck } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { formatINR } from '@/utils';
import { useCategoriesTree } from '@/features/categories/api/use-categories';
import { useShopProducts } from '@/features/products/api/use-products';
import { ProductCard } from '@/features/products/components/product-card';
import { useShopDetail } from '../api/use-shops';

export function ShopCataloguePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);

  const { data: shop, isLoading: shopLoading } = useShopDetail(shopId || '');
  const { data: categories } = useCategoriesTree();
  const { data: products, isLoading: productsLoading } = useShopProducts(
    shopId || '',
    selectedCatId,
  );

  if (shopLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm text-muted">Loading shop catalogue...</div>;
  }

  if (!shop) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-danger mb-4">Butcher shop not found.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shops
      </button>

      {/* Shop profile banner */}
      <div className="rounded-md border border-border bg-surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text">{shop.name}</h1>
                <Badge tone="success" size="sm" dot>FSSAI Verified</Badge>
              </div>
              <p className="text-xs text-muted flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {shop.address.line1}, {shop.address.locality}, {shop.address.city} - {shop.address.pincode}
              </p>
            </div>
          </div>

          <Badge tone={shop.status === 'OPEN' ? 'success' : 'neutral'} size="md">
            {shop.status === 'OPEN' ? 'Open Now' : 'Closed'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>Daily Hours: {shop.openingTime} - {shop.closingTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-primary" />
            <span>Delivery: {shop.deliveryFeePaise === 0 ? 'FREE' : formatINR(shop.deliveryFeePaise)}</span>
            {shop.freeDeliveryAbovePaise && (
              <span className="text-primary font-medium">(Free above {formatINR(shop.freeDeliveryAbovePaise)})</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Service Radius: {shop.serviceRadiusKm} km</span>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCatId(undefined)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedCatId === undefined
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-surface text-muted border-border hover:border-text hover:text-text'
          }`}
        >
          All Fresh Cuts
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCatId(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedCatId === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface text-muted border-border hover:border-text hover:text-text'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="text-center py-16 text-muted text-sm">Loading cuts...</div>
      ) : !products || products.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-12 text-center">
          <p className="text-sm font-semibold text-text">No cuts available</p>
          <p className="text-xs text-muted mt-1">This category currently has no listed cuts from this shop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} shopId={shop.id} />
          ))}
        </div>
      )}
    </div>
  );
}
