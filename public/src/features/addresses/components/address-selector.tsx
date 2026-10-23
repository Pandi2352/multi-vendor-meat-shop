import { useState } from 'react';
import { Briefcase, Check, Home, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/tn-districts';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
} from '../api/use-addresses';
import type { SavedAddress } from '../api/addresses.api';

export interface SelectedAddressData {
  text: string;
  pincode: string;
  district: string;
  label: string;
  location?: { lat: number; lng: number };
}

interface AddressSelectorProps {
  selectedAddress: SelectedAddressData;
  onSelect: (addr: SelectedAddressData) => void;
}

export function AddressSelector({ selectedAddress, onSelect }: AddressSelectorProps) {
  const { data: addresses = [], isLoading } = useAddresses();
  const createMutation = useCreateAddress();
  const deleteMutation = useDeleteAddress();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [label, setLabel] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [text, setText] = useState('');
  const [selectedTownCode, setSelectedTownCode] = useState(VIRUDHUNAGAR_TOWNS[0].code);
  const [pincode, setPincode] = useState(VIRUDHUNAGAR_TOWNS[0].pincode);
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTownChange = (code: string) => {
    setSelectedTownCode(code);
    const town = VIRUDHUNAGAR_TOWNS.find((t) => t.code === code);
    if (town) {
      setPincode(town.pincode);
    }
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (text.trim().length < 5) {
      setError('Please provide a complete street and building address');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setError('Please provide a valid 6-digit Indian PIN code');
      return;
    }

    const town = VIRUDHUNAGAR_TOWNS.find((t) => t.code === selectedTownCode) || VIRUDHUNAGAR_TOWNS[0];

    try {
      const created = await createMutation.mutateAsync({
        label,
        text: `${text.trim()}, ${town.nameEn}`,
        pincode: pincode.trim(),
        district: 'Virudhunagar',
        isDefault,
        lat: 9.568,
        lng: 77.9624,
      });

      onSelect({
        text: created.text,
        pincode: created.pincode,
        district: created.district,
        label: created.label,
        location: created.location,
      });

      setIsAddingNew(false);
      setText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const getLabelIcon = (lbl: string) => {
    if (lbl === 'WORK') return <Briefcase className="h-3.5 w-3.5" />;
    return <Home className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-text">
          Select Delivery Address (Virudhunagar District)
        </label>
        <button
          type="button"
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          {isAddingNew ? 'Choose Saved Address' : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add New Address
            </>
          )}
        </button>
      </div>

      {isAddingNew ? (
        <form onSubmit={handleSaveNew} className="rounded-md border border-border bg-surface-raised p-3 space-y-3">
          <div className="flex items-center gap-2">
            {(['HOME', 'WORK', 'OTHER'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLabel(l)}
                className={`flex-1 py-1 px-2 text-xs rounded-md border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  label === l
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted hover:text-text'
                }`}
              >
                {getLabelIcon(l)}
                {l}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Street Address, Door No., Building</label>
            <input
              type="text"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 15 Madurai Road, Opp Old Bus Stand"
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-muted mb-1">Virudhunagar Town / Taluk</label>
              <select
                value={selectedTownCode}
                onChange={(e) => handleTownChange(e.target.value)}
                className="w-full text-xs rounded-md border border-border bg-surface px-2.5 py-2 text-text focus:outline-none focus:border-primary"
              >
                {VIRUDHUNAGAR_TOWNS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.nameEn} ({d.nameTa})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">PIN Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="626001"
                className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              id="setDefaultCheck"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded-md border-border text-primary focus:ring-0"
            />
            <label htmlFor="setDefaultCheck" className="cursor-pointer">
              Set as primary default address
            </label>
          </div>

          {error ? <div className="text-xs text-red-500">{error}</div> : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>
              Save & Use Address
            </Button>
          </div>
        </form>
      ) : isLoading ? (
        <div className="text-xs text-muted text-center py-3">Loading saved addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted">
          No saved addresses found. Click &quot;Add New Address&quot; above to add your Virudhunagar delivery address.
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {addresses.map((addr: SavedAddress) => {
            const isSelected =
              selectedAddress.text === addr.text &&
              selectedAddress.pincode === addr.pincode;

            return (
              <div
                key={addr.id}
                onClick={() =>
                  onSelect({
                    text: addr.text,
                    pincode: addr.pincode,
                    district: addr.district,
                    label: addr.label,
                    location: addr.location,
                  })
                }
                className={`rounded-md border p-2.5 cursor-pointer flex items-start justify-between gap-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-text ring-1 ring-primary/30'
                    : 'border-border bg-surface text-muted hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 text-primary">{getLabelIcon(addr.label)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text">{addr.label}</span>
                      {addr.isDefault ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-text mt-0.5">{addr.text}</p>
                    <p className="text-[11px] text-muted">
                      {addr.district}, PIN: {addr.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isSelected ? (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(addr.id);
                    }}
                    className="p-1 text-muted hover:text-red-500 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
