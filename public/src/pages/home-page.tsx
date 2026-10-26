import { useMemo, useState } from 'react';
import { Store, MapPin, Search } from 'lucide-react';
import { useNearbyShops } from '@/features/shops/api/use-shops';
import { ShopCard } from '@/features/shops/components/shop-card';
import { useCategoriesTree } from '@/features/categories/api/use-categories';
import { useDistrict } from '@/context/district-context';
import { HeroBanner } from '@/features/shops/components/hero-banner';
import { LocationPickerBar } from '@/features/shops/components/location-picker-bar';

export function HomePage({ onOpenCart }: { onOpenCart: () => void }) {
  const { selectedDistrict, selectedTown, userCoords } = useDistrict();
  const [searchTerm, setSearchTerm] = useState('');

  const activeLat = userCoords?.lat ?? selectedTown.lat;
  const activeLng = userCoords?.lng ?? selectedTown.lng;

  const { data: shops = [], isLoading: shopsLoading } = useNearbyShops(activeLat, activeLng);
  const { data: categories = [] } = useCategoriesTree();

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch =
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.line1.toLowerCase().includes(searchTerm.toLowerCase());

      const shopDistrictOrCity = (shop.address.district || shop.address.city || '').toLowerCase();
      const townKeyword = selectedDistrict.toLowerCase().replace(' town', '');

      const matchesLocation =
        shopDistrictOrCity.includes('virudhunagar') ||
        shopDistrictOrCity.includes(townKeyword) ||
        shop.address.line1.toLowerCase().includes(townKeyword) ||
        true;

      return matchesSearch && matchesLocation;
    });
  }, [shops, searchTerm, selectedDistrict]);

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Hero Banner with GPS Detect */}
      <HeroBanner onOpenCart={onOpenCart} />

      {/* Town & Cut Style Pickers */}
      <LocationPickerBar />

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-text mb-3">Popular Meat Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.id}
                className="rounded-md border border-border bg-surface p-4 hover:border-primary/40 transition-colors"
              >
                <p className="font-semibold text-text text-sm mb-1">{cat.name}</p>
                <span className="text-xs text-primary font-medium">Daily Butchery Cuts</span>
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
              Butcher Shops serving {selectedDistrict}
            </h3>
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-primary" />
              Showing verified butcher stalls in Virudhunagar district & PIN zones
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
              Select another Virudhunagar locality above (e.g. Sivakasi, Rajapalayam, Srivilliputhur) or check back soon as new shops onboard.
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
