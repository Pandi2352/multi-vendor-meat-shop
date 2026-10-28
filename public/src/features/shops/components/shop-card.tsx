import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, Truck, ShieldCheck, ChevronRight, Zap, Star } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { calculateDistanceKm, formatDistance, formatINR } from '@/utils';
import { useDistrict } from '@/context/district-context';
import type { Shop } from '../api/shops.api';

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  const navigate = useNavigate();
  const { userCoords, selectedTown } = useDistrict();
  const isOpen = shop.status === 'OPEN';

  const customerLat = userCoords?.lat ?? selectedTown.lat;
  const customerLng = userCoords?.lng ?? selectedTown.lng;

  const distanceKm =
    shop.distanceMeters !== undefined
      ? Math.round(shop.distanceMeters / 100) / 10
      : calculateDistanceKm(
          customerLat,
          customerLng,
          shop.address.location?.lat ?? 9.568,
          shop.address.location?.lng ?? 77.9624,
        );

  const etaMins = Math.max(25, Math.min(60, Math.round(distanceKm * 3.5 + 20)));

  return (
    <div
      onClick={() => navigate(`/shops/${shop.id}`)}
      className="rounded-md border border-border bg-surface p-5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text leading-tight">{shop.name}</h4>
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-muted shrink-0" />
                <span>{shop.address.locality || shop.address.line1}, {shop.address.city}</span>
              </p>
            </div>
          </div>
          <Badge tone={isOpen ? 'success' : 'neutral'} size="sm" dot>
            {isOpen ? 'Open Now' : 'Closed'}
          </Badge>
        </div>

        {/* Proximity, Rating & Delivery ETA badges */}
        <div className="flex items-center gap-1.5 flex-wrap my-2.5">
          {shop.ratingAverage && shop.ratingAverage > 0 ? (
            <Badge tone="warning" size="sm">
              <Star className="h-3 w-3 fill-warning" />
              <span>{shop.ratingAverage.toFixed(1)}</span>
              <span className="text-muted font-normal">({shop.ratingCount || 0})</span>
            </Badge>
          ) : (
            <Badge tone="neutral" size="sm">
              <Star className="h-3 w-3 text-muted" />
              <span>New</span>
            </Badge>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-surface-muted text-text px-2 py-0.5 rounded-md border border-border">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{formatDistance(distanceKm)}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-success-soft text-success px-2 py-0.5 rounded-md border border-success/20">
            <Zap className="h-3 w-3" />
            <span>Delivers in ~{etaMins}m</span>
          </span>
        </div>

        {shop.description && (
          <p className="text-xs text-muted line-clamp-2 mb-3 mt-1">{shop.description}</p>
        )}

        <div className="space-y-1.5 text-xs text-muted mb-4 border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>{shop.openingTime} - {shop.closingTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>
              {shop.deliveryFeePaise === 0
                ? 'Free delivery'
                : `${formatINR(shop.deliveryFeePaise)} delivery`}
              {shop.freeDeliveryAbovePaise && ` (Free above ${formatINR(shop.freeDeliveryAbovePaise)})`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>FSSAI Certified Fresh Butcher</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        fullWidth
        rightIcon={<ChevronRight className="h-4 w-4" />}
      >
        View Fresh Cuts
      </Button>
    </div>
  );
}
