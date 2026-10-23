import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Clock, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { formatINR } from '@/utils';
import type { Shop } from '../api/shops.api';

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  const navigate = useNavigate();
  const isOpen = shop.status === 'OPEN';

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
                <MapPin className="h-3 w-3 text-muted" />
                {shop.address.locality}, {shop.address.city}
              </p>
            </div>
          </div>
          <Badge tone={isOpen ? 'success' : 'neutral'} size="sm" dot>
            {isOpen ? 'Open Now' : 'Closed'}
          </Badge>
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
            <span>FSSAI Verified Butcher</span>
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
