import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, CustomSelect } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import { useCreateVendor, type VendorProfile } from '../api';

interface AddVendorFormProps {
  onCreated: (vendor: VendorProfile) => void;
  onCancel: () => void;
}

/** Fields and submit for creating an approved stall. The owner is invited by email on success. */
export function AddVendorForm({ onCreated, onCancel }: AddVendorFormProps) {
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
        email: email.trim(),
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
        onSuccess: (vendor) => onCreated(vendor),
      },
    );
  };

  return (
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
          <label className="block font-medium text-text mb-1">Owner email *</label>
          <input
            required
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
          <CustomSelect
            value={town}
            onChange={(val) => handleTownChange(val as string)}
            options={VIRUDHUNAGAR_TOWNS.map((t) => ({
              label: `${t.nameEn} (${t.nameTa})`,
              value: t.nameEn,
              description: `PIN ${t.pincode}`,
            }))}
            searchable
            clearable={false}
            placeholder="Choose town..."
            size="sm"
          />
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
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>
          Add Stall & Activate
        </Button>
      </div>
    </form>
  );
}
