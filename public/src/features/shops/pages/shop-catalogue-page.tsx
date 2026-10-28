import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCategoriesTree } from '@/features/categories/api/use-categories';
import { useShopProducts } from '@/features/products/api/use-products';
import { ProductCard } from '@/features/products/components/product-card';
import { useDistrict } from '@/context/district-context';
import { CUT_FILTER_OPTIONS } from '@/constants/tn-districts';
import { ShopReviewsSection } from '@/features/reviews';
import { useShopDetail } from '../api/use-shops';
import { ShopProfileBanner } from '../components/shop-profile-banner';

export function ShopCataloguePage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { selectedCut, setSelectedCut } = useDistrict();
  const [selectedCatId, setSelectedCatId] = useState<string | undefined>(undefined);

  const { data: shop, isLoading: shopLoading } = useShopDetail(shopId || '');
  const { data: categories } = useCategoriesTree();
  const { data: rawProducts = [], isLoading: productsLoading } = useShopProducts(
    shopId || '',
    selectedCatId,
  );

  const products = rawProducts.filter((product) => {
    if (!selectedCut || selectedCut === 'ALL') return true;
    const cutKeyword = selectedCut.toLowerCase().replace('_cut', '').replace('_', ' ');
    return (
      product.name.toLowerCase().includes(cutKeyword) ||
      (product.description && product.description.toLowerCase().includes(cutKeyword))
    );
  });

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
      <ShopProfileBanner shop={shop} />

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
          All Categories
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

      {/* Cut Style filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-muted text-[11px] font-medium mr-1 whitespace-nowrap">Cut Style:</span>
        {CUT_FILTER_OPTIONS.map((c) => {
          const isSelected = selectedCut === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setSelectedCut(c.code)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap border font-medium transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-muted hover:text-text hover:border-primary/40'
              }`}
            >
              {c.label}
            </button>
          );
        })}
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

      {/* Customer Reviews & Stall Ratings */}
      <div className="pt-8 border-t border-border">
        <ShopReviewsSection shopId={shop.id} shopName={shop.name} />
      </div>
    </div>
  );
}
