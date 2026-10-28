import { CustomSelect, FormField, Input } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import type { VendorFormData, VendorFormErrors } from './add-vendor-form.validation';

interface LocationFieldsProps {
  formData: VendorFormData;
  errors: VendorFormErrors;
  onTownChange: (town: string) => void;
  onUpdate: (key: keyof VendorFormData, value: string) => void;
}

/** Town, locality, pincode, address line and FSSAI fields for add stall form. */
export function AddVendorLocationFields({
  formData,
  errors,
  onTownChange,
  onUpdate,
}: LocationFieldsProps) {
  return (
    <>
      {/* Location: Town, Locality, Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField htmlFor="stall-town" label="Town *" error={errors.town}>
          <CustomSelect
            id="stall-town"
            value={formData.town}
            onChange={(val) => onTownChange(val as string)}
            options={VIRUDHUNAGAR_TOWNS.map((t) => ({
              label: `${t.nameEn} (${t.nameTa})`,
              value: t.nameEn,
              description: `PIN ${t.pincode}`,
            }))}
            searchable
            clearable={false}
            placeholder="Choose town..."
          />
        </FormField>
        <FormField htmlFor="stall-locality" label="Locality *" error={errors.locality}>
          <Input
            id="stall-locality"
            value={formData.locality}
            onChange={(e) => onUpdate('locality', e.target.value)}
            invalid={!!errors.locality}
            placeholder="Car Street"
          />
        </FormField>
        <FormField htmlFor="stall-pincode" label="Pincode *" error={errors.pincode}>
          <Input
            id="stall-pincode"
            maxLength={6}
            value={formData.pincode}
            onChange={(e) => onUpdate('pincode', e.target.value.replace(/\D/g, ''))}
            invalid={!!errors.pincode}
            placeholder="626001"
          />
        </FormField>
      </div>

      {/* Address & FSSAI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <FormField htmlFor="stall-line1" label="Address *" error={errors.line1}>
            <Input
              id="stall-line1"
              value={formData.line1}
              onChange={(e) => onUpdate('line1', e.target.value)}
              invalid={!!errors.line1}
              placeholder="Door No, Street Name"
            />
          </FormField>
        </div>
        <FormField
          htmlFor="stall-fssai"
          label="FSSAI Number (14 Digits) *"
          error={errors.fssaiNumber}
        >
          <Input
            id="stall-fssai"
            maxLength={14}
            value={formData.fssaiNumber}
            onChange={(e) => onUpdate('fssaiNumber', e.target.value.replace(/\D/g, ''))}
            invalid={!!errors.fssaiNumber}
            placeholder="12426008000456"
          />
        </FormField>
      </div>
    </>
  );
}
