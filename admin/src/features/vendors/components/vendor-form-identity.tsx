import { Store } from 'lucide-react';
import { FormField, Input } from '@/components/ui';

interface IdentityCardProps {
  shopName: string;
  shopNameTa: string;
  errorShopName?: string;
  onChange: (key: 'shopName' | 'shopNameTa', val: string) => void;
}

/** Category 1: Stall & Brand Identity */
export function VendorFormIdentityCard({
  shopName,
  shopNameTa,
  errorShopName,
  onChange,
}: IdentityCardProps) {
  return (
    <div className="p-5 md:p-6 rounded-md bg-surface border border-border space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Stall & Brand Identity</h2>
          <p className="text-xs text-muted">Shop trade name displayed to customers in storefront and receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          htmlFor="stall-shop-name"
          label="Shop Name (English) *"
          hint="Official registered name of the butcher stall"
          error={errorShopName}
        >
          <Input
            id="stall-shop-name"
            value={shopName}
            onChange={(e) => onChange('shopName', e.target.value)}
            invalid={!!errorShopName}
            placeholder="e.g. Sivakasi Fresh Mutton & Poultry"
          />
        </FormField>

        <FormField
          htmlFor="stall-shop-name-ta"
          label="Shop Name in Tamil / கடையின் பெயர் (தமிழ்)"
          hint="Local language name shown to Tamil-speaking patrons"
        >
          <Input
            id="stall-shop-name-ta"
            value={shopNameTa}
            onChange={(e) => onChange('shopNameTa', e.target.value)}
            placeholder="e.g. சிவகாசி பிரஷ் மட்டன் & சிக்கன்"
          />
        </FormField>
      </div>
    </div>
  );
}
