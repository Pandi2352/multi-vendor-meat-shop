import { useEffect } from 'react';
import { Store, ChevronDown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token-storage';
import { useAllShops } from '../api';

export function ShopSwitcher() {
  const queryClient = useQueryClient();
  const { data: shopsData } = useAllShops();
  const shops = shopsData?.items || [];
  const currentShopId = tokenStorage.getActiveShopId() || shops[0]?.id || '';

  useEffect(() => {
    if (!tokenStorage.getActiveShopId() && shops.length > 0 && shops[0]?.id) {
      tokenStorage.setActiveShopId(shops[0].id);
    }
  }, [shops]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newShopId = e.target.value;
    tokenStorage.setActiveShopId(newShopId);
    queryClient.invalidateQueries();
  };

  if (shops.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-xs">
      <Store className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-muted text-[11px] font-medium hidden sm:inline">Active Stall:</span>
      <div className="relative">
        <select
          value={currentShopId}
          onChange={handleSelect}
          className="bg-transparent text-text font-semibold text-xs pr-6 cursor-pointer focus:outline-none appearance-none"
        >
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name} ({shop.address.locality || shop.address.city})
            </option>
          ))}
        </select>
        <ChevronDown className="h-3 w-3 text-muted absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
