import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/tn-districts';
import { useApplyVendor, type VendorApplicationResponse } from '../api/vendor-apply.api';

const SPECIALTIES = [
  'Broiler Chicken',
  'Country Chicken (நாட்டுக்கோழி)',
  'Goat Mutton (ஆட்டுக்கறி)',
  'Fish & Seafood (மீன்)',
  'Quail (காடை)',
];

interface VendorApplyFormProps {
  onSuccess: (data: VendorApplicationResponse, fssai: string) => void;
  onCancel: () => void;
}

export function VendorApplyForm({ onSuccess, onCancel }: VendorApplyFormProps) {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [town, setTown] = useState(VIRUDHUNAGAR_TOWNS[0].nameEn);
  const [locality, setLocality] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState(VIRUDHUNAGAR_TOWNS[0].pincode);
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([SPECIALTIES[0], SPECIALTIES[2]]);

  const applyMutation = useApplyVendor();

  const handleTownChange = (selectedTownName: string) => {
    setTown(selectedTownName);
    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === selectedTownName);
    if (townData) setPincode(townData.pincode);
  };

  const toggleSpecialty = (item: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate(
      {
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        town,
        locality: locality.trim() || town,
        addressLine: addressLine.trim(),
        pincode: pincode.trim(),
        fssaiNumber: fssaiNumber.trim(),
        categoriesOffered: selectedSpecialties,
      },
      {
        onSuccess: (data) => onSuccess(data, fssaiNumber.trim()),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto text-xs">
      {applyMutation.isError && (
        <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to submit. Please check mobile and FSSAI number.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-medium text-text mb-1">Owner Name *</label>
          <input
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. K. Murugan"
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block font-medium text-text mb-1">Stall Name *</label>
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sivakasi Fresh Mutton"
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
            placeholder="stall@gmail.com"
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-medium text-text mb-1">Town *</label>
          <select
            value={town}
            onChange={(e) => handleTownChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          >
            {VIRUDHUNAGAR_TOWNS.map((t) => (
              <option key={t.code} value={t.nameEn}>{t.nameEn} ({t.nameTa})</option>
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
        <label className="block font-medium text-text mb-1">Street Address *</label>
        <input
          required
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Door No, Street Name, Landmark"
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

      <div>
        <label className="block font-medium text-text mb-1">Specialties Offered</label>
        <div className="grid grid-cols-2 gap-1.5">
          {SPECIALTIES.map((spec) => (
            <label key={spec} className="flex items-center gap-1.5 text-text cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSpecialties.includes(spec)}
                onChange={() => toggleSpecialty(spec)}
                className="rounded-md border-border text-primary focus:ring-0"
              />
              <span>{spec}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={applyMutation.isPending}>
          Submit Application
        </Button>
      </div>
    </form>
  );
}
