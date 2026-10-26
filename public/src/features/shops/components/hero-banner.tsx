import { Link } from 'react-router-dom';
import { Store, Sparkles, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useDistrict } from '@/context/district-context';

export function HeroBanner({ onOpenCart }: { onOpenCart: () => void }) {
  const { selectedDistrict, detectLocation, isLocating, isGpsDetected } = useDistrict();

  return (
    <section className="rounded-md border border-border bg-surface p-6 sm:p-10">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-muted text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Virudhunagar Meat Marketplace
          </span>
          <button
            type="button"
            onClick={detectLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface text-xs font-medium text-text hover:border-primary transition-colors cursor-pointer"
          >
            {isLocating ? (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            ) : (
              <Navigation className="h-3 w-3 text-primary" />
            )}
            <span>
              {isGpsDetected ? '📍 GPS: ' : ''}
              {selectedDistrict}
            </span>
            <span className="text-[10px] text-primary underline ml-1">
              {isLocating ? 'Detecting...' : 'Detect'}
            </span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mb-3">
          Fresh cut meat delivered directly from Virudhunagar&apos;s trusted butchers
        </h2>
        <p className="text-sm text-muted mb-6">
          Exact weight ordering in grams, zero hidden charges, transparent pricing in paise, and Cash on Delivery across Virudhunagar, Sivakasi, Rajapalayam, Srivilliputhur & Aruppukkottai.
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
  );
}
