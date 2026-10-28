import { useState } from 'react';
import { Store, Plus, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { formatINR, formatWeight } from '@/utils';
import { useAddCartItem } from '@/features/cart/api/use-cart';
import type { FavouriteItem } from '../api/favourites.api';
import { FavouriteButton } from './favourite-button';

interface FavouriteCardProps {
  item: FavouriteItem;
}

export function FavouriteCard({ item }: FavouriteCardProps) {
  const addCartItem = useAddCartItem();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      await addCartItem.mutateAsync({
        shopId: item.shopId,
        productId: item.productId,
        grams: item.minGrams,
        quantity: 1,
        cutType: 'CURRY_CUT',
        preparation: 'CLEANED',
        clearPreviousShop: true,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      // Handled by API error interceptor
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-bold text-sm text-text leading-snug">{item.productName}</h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
              <Store className="h-3.5 w-3.5 text-primary" />
              <span>{item.shopName}</span>
            </div>
          </div>
          <FavouriteButton productId={item.productId} size="sm" />
        </div>

        <div className="flex items-center gap-2 mt-2">
          {item.categoryName && (
            <span className="text-[11px] font-medium text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
              {item.categoryName}
            </span>
          )}
          {item.isAvailable ? (
            <Badge tone="success" size="sm" dot>
              In Stock ({formatWeight(item.availableGrams)})
            </Badge>
          ) : (
            <Badge tone="danger" size="sm">
              Out of Stock Today
            </Badge>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-3 mt-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-muted block">
            {formatINR(item.pricePerKgPaise)} / kg
          </span>
          <span className="text-xs text-muted">
            Min: {formatWeight(item.minGrams)}
          </span>
        </div>

        <Button
          variant={justAdded ? 'secondary' : 'primary'}
          size="sm"
          disabled={!item.isAvailable}
          loading={addCartItem.isPending}
          onClick={handleAddToCart}
          leftIcon={justAdded ? <Check className="h-4 w-4 text-success" /> : <Plus className="h-4 w-4" />}
        >
          {justAdded ? 'Added' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}
