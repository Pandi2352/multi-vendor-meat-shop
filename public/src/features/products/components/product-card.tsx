import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { formatINR, priceForGrams } from '@/utils';
import { useAddCartItem } from '@/features/cart/api/use-cart';
import type { Product } from '../api/products.api';
import { WeightSelector } from './weight-selector';
import { PreparationSelector } from './preparation-selector';

interface ProductCardProps {
  product: Product;
  shopId: string;
}

export function ProductCard({ product, shopId }: ProductCardProps) {
  const addCartItem = useAddCartItem();
  const [selectedWeight, setSelectedWeight] = useState<number>(
    product.allowedWeightsGrams?.[0] || product.minGrams || 500,
  );
  const [selectedPrep, setSelectedPrep] = useState<string>(
    product.allowedPreparation?.[0] || 'CLEANED',
  );
  const [justAdded, setJustAdded] = useState(false);

  const portionPricePaise = priceForGrams(product.pricePerKgPaise, selectedWeight);

  const handleAddToCart = async () => {
    try {
      await addCartItem.mutateAsync({
        shopId,
        productId: product.id,
        grams: selectedWeight,
        quantity: 1,
        cutType: product.cutType,
        preparation: selectedPrep as 'CLEANED' | 'SKIN_ON' | 'SKIN_OFF',
        clearPreviousShop: true, // Auto-switches if user confirms
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      // Handled by API error interceptor
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface p-4 flex flex-col justify-between hover:border-border/80 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-bold text-sm text-text leading-snug">{product.name}</h4>
            {product.cutType && (
              <span className="inline-block mt-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {product.cutType.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          {product.isFreshDaily && (
            <Badge tone="success" size="sm" dot>
              Fresh Batch
            </Badge>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-muted line-clamp-2 mb-3">{product.description}</p>
        )}

        {/* Portion selector */}
        <div className="mb-3">
          <label className="block text-[11px] font-medium text-muted mb-1.5">Select Weight</label>
          <WeightSelector
            weights={product.allowedWeightsGrams}
            selectedWeight={selectedWeight}
            onSelect={setSelectedWeight}
          />
        </div>

        {/* Preparation selection if butcher offers choices */}
        {product.allowedPreparation && product.allowedPreparation.length > 1 && (
          <div className="mb-3">
            <PreparationSelector
              options={product.allowedPreparation}
              selectedPrep={selectedPrep}
              onSelect={setSelectedPrep}
            />
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 mt-2 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-muted block">
            {formatINR(product.pricePerKgPaise)} / kg
          </span>
          <span className="text-base font-bold text-text">{formatINR(portionPricePaise)}</span>
        </div>

        <Button
          variant={justAdded ? 'secondary' : 'primary'}
          size="sm"
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
