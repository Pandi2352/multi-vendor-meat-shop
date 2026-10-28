import { CustomSelect, FormField, Input } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';

interface EditLocationFieldsProps {
  town: string;
  locality: string;
  pincode: string;
  line1: string;
  municipalPermitNumber: string;
  openingTime: string;
  closingTime: string;
  serviceRadiusKm: number;
  errors: {
    town?: string;
    locality?: string;
    pincode?: string;
    line1?: string;
    timing?: string;
  };
  onTownChange: (town: string) => void;
  onUpdate: (key: string, value: string | number) => void;
}

/** Location, permit, operating hours and delivery radius fields for edit stall. */
export function EditVendorLocationFields({
  town,
  locality,
  pincode,
  line1,
  municipalPermitNumber,
  openingTime,
  closingTime,
  serviceRadiusKm,
  errors,
  onTownChange,
  onUpdate,
}: EditLocationFieldsProps) {
  return (
    <>
      {/* Location: Town, Locality, Pincode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField htmlFor="edit-town" label="Town *" error={errors.town}>
          <CustomSelect
            id="edit-town"
            value={town}
            onChange={(val) => onTownChange(val as string)}
            options={VIRUDHUNAGAR_TOWNS.map((t) => ({
              label: `${t.nameEn} (${t.nameTa})`,
              value: t.nameEn,
              description: `PIN ${t.pincode}`,
            }))}
            searchable
            clearable={false}
          />
        </FormField>
        <FormField htmlFor="edit-locality" label="Locality *" error={errors.locality}>
          <Input
            id="edit-locality"
            value={locality}
            onChange={(e) => onUpdate('locality', e.target.value)}
            invalid={!!errors.locality}
          />
        </FormField>
        <FormField htmlFor="edit-pincode" label="Pincode *" error={errors.pincode}>
          <Input
            id="edit-pincode"
            maxLength={6}
            value={pincode}
            onChange={(e) => onUpdate('pincode', e.target.value.replace(/\D/g, ''))}
            invalid={!!errors.pincode}
          />
        </FormField>
      </div>

      {/* Address & Municipal Permit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <FormField htmlFor="edit-line1" label="Address *" error={errors.line1}>
            <Input
              id="edit-line1"
              value={line1}
              onChange={(e) => onUpdate('line1', e.target.value)}
              invalid={!!errors.line1}
            />
          </FormField>
        </div>
        <FormField htmlFor="edit-municipal" label="Municipal Permit">
          <Input
            id="edit-municipal"
            value={municipalPermitNumber}
            onChange={(e) => onUpdate('municipalPermitNumber', e.target.value)}
            placeholder="VDR-MC-VERIFIED"
          />
        </FormField>
      </div>

      {/* Operating Hours & Hyperlocal Radius */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField htmlFor="edit-open-time" label="Opens At">
          <Input
            id="edit-open-time"
            type="time"
            value={openingTime}
            onChange={(e) => onUpdate('openingTime', e.target.value)}
          />
        </FormField>
        <FormField htmlFor="edit-close-time" label="Closes At" error={errors.timing}>
          <Input
            id="edit-close-time"
            type="time"
            value={closingTime}
            onChange={(e) => onUpdate('closingTime', e.target.value)}
            invalid={!!errors.timing}
          />
        </FormField>
        <FormField htmlFor="edit-radius" label="Delivery Radius (km)">
          <Input
            id="edit-radius"
            type="number"
            min={1}
            max={50}
            value={serviceRadiusKm}
            onChange={(e) => onUpdate('serviceRadiusKm', Number(e.target.value))}
          />
        </FormField>
      </div>
    </>
  );
}
