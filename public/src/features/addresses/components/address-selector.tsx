import { useState } from 'react';
import { Briefcase, Check, Home, Plus, Trash2 } from 'lucide-react';
import { useAddresses, useDeleteAddress } from '../api/use-addresses';
import type { SavedAddress } from '../api/addresses.api';
import { AddressForm } from './address-form';

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
  const deleteMutation = useDeleteAddress();
  const [isAddingNew, setIsAddingNew] = useState(false);

  const getLabelIcon = (lbl: string) => {
    if (lbl === 'WORK') return <Briefcase className="h-3.5 w-3.5" />;
    return <Home className="h-3.5 w-3.5" />;
  };

  const handleFormSuccess = (addr: SelectedAddressData) => {
    onSelect(addr);
    setIsAddingNew(false);
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
          {isAddingNew ? (
            'Choose Saved Address'
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add New Address
            </>
          )}
        </button>
      </div>

      {isAddingNew ? (
        <AddressForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsAddingNew(false)}
        />
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
                    className="p-1 text-muted hover:text-danger rounded-md transition-colors"
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
