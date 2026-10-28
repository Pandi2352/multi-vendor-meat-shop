import { Store, MapPin, Clock, Truck, ShieldCheck, Star } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatINR } from '@/utils';
import type { Shop } from '../api/shops.api';

interface ShopProfileBannerProps {
  shop: Shop;
}

export function ShopProfileBanner({ shop }: ShopProfileBannerProps) {
  const isOpen = shop.status === 'OPEN';

  return (
    <div className="rounded-md border border-border bg-surface p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text">{shop.name}</h1>
              {shop.ratingAverage && shop.ratingAverage > 0 ? (
                <Badge tone="warning" size="sm">
                  <Star className="h-3.5 w-3.5 fill-warning" />
                  <span className="font-bold">{shop.ratingAverage.toFixed(1)}</span>
                  <span className="text-muted font-normal">({shop.ratingCount} reviews)</span>
                </Badge>
              ) : null}
              <Badge tone="success" size="sm" dot>FSSAI Verified</Badge>
            </div>
            <p className="text-xs text-muted flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {shop.address.line1}, {shop.address.locality}, {shop.address.city} - {shop.address.pincode}
            </p>
          </div>
        </div>

        <Badge tone={isOpen ? 'success' : 'neutral'} size="md">
          {isOpen ? 'Open Now' : 'Closed'}
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
  );
}
