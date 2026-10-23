import { Link } from 'react-router-dom';
import { Store, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useNearbyShops } from '@/features/shops/api/use-shops';
import { ShopCard } from '@/features/shops/components/shop-card';
import { useCategoriesTree } from '@/features/categories/api/use-categories';

export function HomePage({ onOpenCart }: { onOpenCart: () => void }) {
  const { data: shops, isLoading: shopsLoading } = useNearbyShops();
  const { data: categories } = useCategoriesTree();

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Hero Banner */}
      <section className="rounded-md border border-border bg-surface p-6 sm:p-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-md border border-border bg-surface-muted text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Hyperlocal Meat Marketplace
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mb-3">
            Fresh cut meat delivered directly from trusted local butchers
          </h2>
          <p className="text-sm text-muted mb-6">
            Exact weight ordering in grams, zero hidden charges, transparent pricing in paise, and lightning-fast delivery across Tamil Nadu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" leftIcon={<Store className="h-4 w-4" />} onClick={onOpenCart}>
              View Cart
            </Button>
            <Link to="/orders">
              <Button variant="outline">Track Orders</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-text mb-3">Popular Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.id}
                className="rounded-md border border-border bg-surface p-4 hover:border-primary/40 transition-colors"
              >
                <p className="font-semibold text-text text-sm mb-1">{cat.name}</p>
                <span className="text-xs text-primary font-medium">Fresh Daily Cuts</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Butcher Shops */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text">Nearby Verified Butcher Shops</h3>
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-primary" /> Delivery in Chennai & suburbs
            </p>
          </div>
        </div>

        {shopsLoading ? (
          <div className="text-center py-12 text-muted text-sm">Finding nearby butchers...</div>
        ) : !shops || shops.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-8 text-center">
            <Store className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-text">No active butchers in range</p>
            <p className="text-xs text-muted mt-1">Check back soon as more shops get approved in your locality.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
