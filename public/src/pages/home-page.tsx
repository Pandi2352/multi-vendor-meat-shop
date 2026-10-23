import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Sparkles, Search, Scissors } from 'lucide-react';
import { Button } from '@/components/ui';
import { useNearbyShops } from '@/features/shops/api/use-shops';
import { ShopCard } from '@/features/shops/components/shop-card';
import { useCategoriesTree } from '@/features/categories/api/use-categories';
import { useDistrict } from '@/context/district-context';
import { CUT_FILTER_OPTIONS } from '@/constants/tn-districts';

export function HomePage({ onOpenCart }: { onOpenCart: () => void }) {
  const { selectedDistrict, selectedCut, setSelectedCut } = useDistrict();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: shops = [], isLoading: shopsLoading } = useNearbyShops();
  const { data: categories = [] } = useCategoriesTree();

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.line1.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDistrict =
        !shop.address.district ||
        shop.address.district.toLowerCase() === selectedDistrict.toLowerCase() ||
        selectedDistrict === 'Chennai'; // Default fallback shows available shops

      return matchesSearch && matchesDistrict;
    });
  }, [shops, searchTerm, selectedDistrict]);

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Hero Banner */}
      <section className="rounded-md border border-border bg-surface p-6 sm:p-10">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-muted text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Hyperlocal Meat Marketplace
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface text-xs font-medium text-text">
              <MapPin className="h-3 w-3 text-primary" /> {selectedDistrict}, Tamil Nadu
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mb-3">
            Fresh cut meat delivered directly from trusted local butchers
          </h2>
          <p className="text-sm text-muted mb-6">
            Exact weight ordering in grams, zero hidden charges, transparent pricing in paise, and Cash on Delivery across Tamil Nadu.
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

      {/* Cut Style Filter Pills */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Scissors className="h-4 w-4 text-primary" />
            Filter by Cut Style
          </h3>
          <span className="text-xs text-muted">Fresh butcher preparation</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CUT_FILTER_OPTIONS.map((cut) => {
            const isActive = selectedCut === cut.code;
            return (
              <button
                key={cut.code}
                type="button"
                onClick={() => setSelectedCut(cut.code)}
                className={`px-3 py-1.5 text-xs rounded-md border whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted hover:text-text hover:border-primary/40'
                }`}
              >
                <span>{cut.label}</span>
                <span className="opacity-75 ml-1 text-[10px]">({cut.labelTa})</span>
              </button>
            );
          })}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-text">
              Butcher Shops in {selectedDistrict}
            </h3>
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-primary" />
              Showing local vendors serving {selectedDistrict} & surrounding PIN zones
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search shops or cuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {shopsLoading ? (
          <div className="text-center py-12 text-muted text-sm">Finding butchers in {selectedDistrict}...</div>
        ) : filteredShops.length === 0 ? (
          <div className="rounded-md border border-border bg-surface p-8 text-center">
            <Store className="h-8 w-8 text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-text">No active butchers found in {selectedDistrict}</p>
            <p className="text-xs text-muted mt-1">
              Select another Tamil Nadu district from the top bar or check back soon as new shops onboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
