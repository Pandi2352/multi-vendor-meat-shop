import { useState } from 'react';
import { Briefcase, Home, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/tn-districts';
import { useCreateAddress } from '../api/use-addresses';
import type { SelectedAddressData } from './address-selector';

interface AddressFormProps {
  onSuccess: (addr: SelectedAddressData) => void;
  onCancel: () => void;
}

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const createMutation = useCreateAddress();
  const [label, setLabel] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [text, setText] = useState('');
  const [townCode, setTownCode] = useState(VIRUDHUNAGAR_TOWNS[0].code);
  const [pincode, setPincode] = useState(VIRUDHUNAGAR_TOWNS[0].pincode);
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTownChange = (code: string) => {
    setTownCode(code);
    const town = VIRUDHUNAGAR_TOWNS.find((t) => t.code === code);
    if (town) setPincode(town.pincode);
  };

  const handleSave = async (e: React.FormEvent) => {
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

    const town = VIRUDHUNAGAR_TOWNS.find((t) => t.code === townCode) || VIRUDHUNAGAR_TOWNS[0];
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

      onSuccess({
        text: created.text,
        pincode: created.pincode,
        district: created.district,
        label: created.label,
        location: created.location,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-md border border-border bg-surface-muted p-3 space-y-3">
      <div className="flex items-center gap-2">
        {(['HOME', 'WORK', 'OTHER'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLabel(l)}
            className={`flex-1 py-1 px-2 text-xs rounded-md border font-medium flex items-center justify-center gap-1.5 transition-colors ${
              label === l ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted hover:text-text'
            }`}
          >
            {l === 'WORK' ? <Briefcase className="h-3.5 w-3.5" /> : l === 'HOME' ? <Home className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {l}
          </button>
        ))}
      </div>

      <input
        type="text"
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Street address, door no., building..."
        className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-primary"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={townCode}
          onChange={(e) => handleTownChange(e.target.value)}
          className="w-full text-xs rounded-md border border-border bg-surface px-2.5 py-2 text-text focus:outline-none focus:border-primary"
        >
          {VIRUDHUNAGAR_TOWNS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.nameEn}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="PIN Code"
          className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-primary font-mono"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          id="setDefaultCheck"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="rounded-md border-border text-primary focus:ring-0"
        />
        <label htmlFor="setDefaultCheck" className="cursor-pointer">Set as primary default address</label>
      </div>

      {error ? <div className="text-xs text-danger">{error}</div> : null}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>Save & Use</Button>
      </div>
    </form>
  );
}
