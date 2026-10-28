import { useState, useEffect } from 'react';
import { Home, Briefcase, MapPin, X } from 'lucide-react';
import { Button, Alert, toast } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/tn-districts';
import { useCreateAddress, useUpdateAddress } from '../api/use-addresses';
import type { SavedAddress } from '../api/addresses.api';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: SavedAddress | null;
}

export function AddressModal({ isOpen, onClose, addressToEdit }: AddressModalProps) {
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();

  const [label, setLabel] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [text, setText] = useState('');
  const [selectedTownCode, setSelectedTownCode] = useState(VIRUDHUNAGAR_TOWNS[0].code);
  const [pincode, setPincode] = useState(VIRUDHUNAGAR_TOWNS[0].pincode);
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (addressToEdit) {
      setLabel(addressToEdit.label);
      setText(addressToEdit.text);
      setPincode(addressToEdit.pincode);
      setIsDefault(addressToEdit.isDefault);
    } else {
      setLabel('HOME');
      setText('');
      setSelectedTownCode(VIRUDHUNAGAR_TOWNS[0].code);
      setPincode(VIRUDHUNAGAR_TOWNS[0].pincode);
      setIsDefault(false);
    }
    setErrorMsg(null);
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTownChange = (code: string) => {
    setSelectedTownCode(code);
    const town = VIRUDHUNAGAR_TOWNS.find((t) => t.code === code);
    if (town) {
      setPincode(town.pincode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (text.trim().length < 5) {
      setErrorMsg('Please provide a complete street and building address (at least 5 characters)');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      setErrorMsg('Please provide a valid 6-digit Indian PIN code');
      return;
    }

    const town = VIRUDHUNAGAR_TOWNS.find((t) => t.code === selectedTownCode) || VIRUDHUNAGAR_TOWNS[0];

    try {
      if (addressToEdit) {
        await updateMutation.mutateAsync({
          id: addressToEdit.id,
          body: {
            label,
            text: text.trim(),
            pincode: pincode.trim(),
            district: 'Virudhunagar',
            isDefault,
          },
        });
        toast.success('Address updated successfully');
      } else {
        await createMutation.mutateAsync({
          label,
          text: text.trim().includes(town.nameEn) ? text.trim() : `${text.trim()}, ${town.nameEn}`,
          pincode: pincode.trim(),
          district: 'Virudhunagar',
          isDefault,
          lat: 9.568,
          lng: 77.9624,
        });
        toast.success('New delivery address saved');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-text">
            {addressToEdit ? 'Edit Delivery Address' : 'Add New Delivery Address'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-text hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && <Alert tone="danger">{errorMsg}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            {(['HOME', 'WORK', 'OTHER'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLabel(l)}
                className={`flex-1 py-1.5 px-2 text-xs rounded-md border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  label === l
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-muted hover:text-text'
                }`}
              >
                {l === 'WORK' ? <Briefcase className="h-3.5 w-3.5" /> : l === 'HOME' ? <Home className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                {l}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Flat / Door No., Street & Landmark *
            </label>
            <textarea
              rows={2}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 15 Madurai Road, Opp Old Bus Stand"
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Town / Taluk</label>
              <select
                value={selectedTownCode}
                onChange={(e) => handleTownChange(e.target.value)}
                className="w-full text-xs rounded-md border border-border bg-surface px-2.5 py-2 text-text focus:outline-none focus:border-primary"
              >
                {VIRUDHUNAGAR_TOWNS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="626001"
                className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="modalDefaultCheck"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded-md border-border text-primary focus:ring-0"
            />
            <label htmlFor="modalDefaultCheck" className="text-xs text-text cursor-pointer">
              Set as primary default address
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSaving}>
              {addressToEdit ? 'Save Changes' : 'Save Address'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
