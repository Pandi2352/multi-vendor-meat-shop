import { useState, useEffect } from 'react';
import { X, Store } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ShopProfile, UpdateShopPayload } from '../api';

interface EditShopModalProps {
  shop: ShopProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateShopPayload) => void;
  isSubmitting: boolean;
}

export function EditShopModal({ shop, isOpen, onClose, onSubmit, isSubmitting }: EditShopModalProps) {
  const [phone, setPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);
  const [deliveryFeeRupees, setDeliveryFeeRupees] = useState(30);
  const [status, setStatus] = useState<'OPEN' | 'CLOSED' | 'PAUSED'>('OPEN');

  useEffect(() => {
    if (shop) {
      setPhone(shop.phone || '');
      setOpeningTime(shop.openingTime || '06:00');
      setClosingTime(shop.closingTime || '21:00');
      setServiceRadiusKm(shop.serviceRadiusKm || 10);
      setDeliveryFeeRupees(Math.round((shop.deliveryFeePaise || 3000) / 100));
      setStatus(shop.status || 'OPEN');
    }
  }, [shop, isOpen]);

  if (!isOpen || !shop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      phone: phone.trim(),
      openingTime,
      closingTime,
      serviceRadiusKm: Number(serviceRadiusKm),
      deliveryFeePaise: Math.round(deliveryFeeRupees * 100),
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-text">Edit Butcher Stall Details</h3>
              <p className="text-xs text-muted">{shop.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-medium text-text block mb-1">Stall Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-text block mb-1">Morning Open Time</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="font-medium text-text block mb-1">Night Close Time</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-text block mb-1">Delivery Radius (km)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="font-medium text-text block mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={deliveryFeeRupees}
                onChange={(e) => setDeliveryFeeRupees(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-text block mb-1">Stall Ordering Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'OPEN' | 'CLOSED' | 'PAUSED')}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            >
              <option value="OPEN">Open for Live Customer Orders</option>
              <option value="PAUSED">Paused (Temporarily busy butchering)</option>
              <option value="CLOSED">Closed for the day</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              Save Stall Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
