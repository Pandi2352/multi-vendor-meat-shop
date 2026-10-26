import { useState } from 'react';
import { X, Store, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import { useCreateVendor } from '../api';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVendorModal({ isOpen, onClose }: AddVendorModalProps) {
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [town, setTown] = useState(VIRUDHUNAGAR_TOWNS[0].nameEn);
  const [locality, setLocality] = useState('');
  const [line1, setLine1] = useState('');
  const [pincode, setPincode] = useState(VIRUDHUNAGAR_TOWNS[0].pincode);
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('21:00');

  const createMutation = useCreateVendor();

  if (!isOpen) return null;

  const handleTownChange = (selectedTownName: string) => {
    setTown(selectedTownName);
    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === selectedTownName);
    if (townData) setPincode(townData.pincode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === town);
    createMutation.mutate(
      {
        ownerName: ownerName.trim(),
        shopName: shopName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        fssaiNumber: fssaiNumber.trim(),
        openingTime,
        closingTime,
        address: {
          line1: line1.trim(),
          locality: locality.trim() || town,
          city: town,
          district: 'Virudhunagar',
          pincode: pincode.trim(),
          location: townData ? { lat: townData.lat, lng: townData.lng } : undefined,
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text">Add New Butcher Stall / புதிய கடை</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto text-xs">
          {createMutation.isError && (
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to add stall. Check phone or FSSAI number.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-text mb-1">Owner Name *</label>
              <input
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. M. Ramasamy"
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Shop Name *</label>
              <input
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Sivakasi Broiler Centre"
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-text mb-1">Mobile (10 Digits) *</label>
              <input
                required
                type="tel"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9842012345"
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="stall@example.com"
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-text mb-1">Town *</label>
              <select
                value={town}
                onChange={(e) => handleTownChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              >
                {VIRUDHUNAGAR_TOWNS.map((t) => (
                  <option key={t.code} value={t.nameEn}>{t.nameEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Locality *</label>
              <input
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Car Street"
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Pincode *</label>
              <input
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-text mb-1">Address *</label>
            <input
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="Door No, Street Name"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium text-text mb-1">FSSAI Number (14 Digits) *</label>
            <input
              required
              maxLength={14}
              pattern="[0-9]{14}"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              placeholder="12426008000456"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-text mb-1">Opens At</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-text mb-1">Closes At</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>
              Add Stall & Activate
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
