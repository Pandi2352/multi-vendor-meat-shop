import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Package, Store, Navigation, Loader2, HelpCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCart } from '@/features/cart/api/use-cart';
import { useFavouriteIds } from '@/features/favourites';
import { useDistrict } from '@/context/district-context';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/tn-districts';

interface StorefrontHeaderProps {
  onOpenCart: () => void;
  onOpenPartnerModal: () => void;
}

export function StorefrontHeader({
  onOpenCart,
  onOpenPartnerModal,
}: StorefrontHeaderProps) {
  const { data: cart } = useCart();
  const { data: favouriteIds = [] } = useFavouriteIds();
  const { selectedDistrict, setSelectedDistrict, detectLocation, isLocating, isGpsDetected } =
    useDistrict();
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="border-b border-border bg-surface sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            VNR
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-text">Virudhunagar Meat Shop</h1>
            <p className="text-xs text-muted">Virudhunagar District Hyperlocal Marketplace</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Virudhunagar Towns / Taluks Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-muted text-xs">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              title="Click to detect nearest butcher via GPS"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isGpsDetected ? (
                <Navigation className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600/20" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-primary" />
              )}
            </button>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text focus:outline-none cursor-pointer pr-1 max-w-[130px] sm:max-w-none truncate"
              aria-label="Select Virudhunagar Town or Locality"
            >
              {VIRUDHUNAGAR_TOWNS.map((d) => (
                <option key={d.code} value={d.nameEn} className="bg-surface text-text">
                  {d.nameEn} ({d.nameTa})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPartnerModal}
            className="hidden sm:inline-flex"
            leftIcon={<Store className="h-4 w-4 text-primary" />}
          >
            Partner With Us
          </Button>

          <Link to="/addresses" className="hidden md:inline-flex">
            <Button variant="outline" size="sm" leftIcon={<MapPin className="h-4 w-4" />}>
              Addresses
            </Button>
          </Link>

          <Link to="/favourites" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" leftIcon={<Heart className="h-4 w-4 text-danger" />}>
              Saved{favouriteIds.length > 0 ? ` (${favouriteIds.length})` : ''}
            </Button>
          </Link>

          <Link to="/orders">
            <Button variant="outline" size="sm" leftIcon={<Package className="h-4 w-4" />}>
              Orders
            </Button>
          </Link>

          <Link to="/tickets" className="hidden lg:inline-flex">
            <Button variant="outline" size="sm" leftIcon={<HelpCircle className="h-4 w-4" />}>
              Support
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
