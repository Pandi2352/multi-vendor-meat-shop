import { MapPin } from 'lucide-react';
import { CustomSelect, FormField, Input } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';

interface PremisesCardProps {
  town: string;
  locality: string;
  pincode: string;
  line1: string;
  serviceRadiusKm: number;
  errorTown?: string;
  errorLocality?: string;
  errorPincode?: string;
  errorLine1?: string;
  onTownChange: (town: string) => void;
  onChange: (key: 'locality' | 'pincode' | 'line1' | 'serviceRadiusKm', val: string | number) => void;
}

/** Premises & Coverage Card - 4 columns in Row 1 and full-width Street Address in Row 2 */
export function VendorFormPremisesCard({
  town,
  locality,
  pincode,
  line1,
  serviceRadiusKm,
  errorTown,
  errorLocality,
  errorPincode,
  errorLine1,
  onTownChange,
  onChange,
}: PremisesCardProps) {
  return (
    <div className="p-4 md:p-5 rounded-md bg-surface border border-border space-y-3.5">
      <div className="flex items-center gap-2 pb-2.5 border-b border-border">
        <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Premises & Service Coverage</h2>
          <p className="text-[11px] text-muted">Butchery physical location and customer doorstep delivery reach</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <FormField htmlFor="stall-town" label="Town / Hub *" error={errorTown}>
          <CustomSelect
            id="stall-town"
            value={town}
            onChange={(val) => onTownChange(val as string)}
            options={VIRUDHUNAGAR_TOWNS.map((t) => ({
              label: `${t.nameEn} (${t.nameTa})`,
              value: t.nameEn,
              description: `PIN ${t.pincode}`,
            }))}
            searchable
            clearable={false}
            placeholder="Select town..."
          />
        </FormField>

        <FormField htmlFor="stall-locality" label="Locality / Landmark *" error={errorLocality}>
          <Input
            id="stall-locality"
            value={locality}
            onChange={(e) => onChange('locality', e.target.value)}
            invalid={!!errorLocality}
            placeholder="e.g. Car Street / Bus Stand"
          />
        </FormField>

        <FormField htmlFor="stall-pincode" label="Postal PIN Code *" error={errorPincode}>
          <Input
            id="stall-pincode"
            maxLength={6}
            value={pincode}
            onChange={(e) => onChange('pincode', e.target.value.replace(/\D/g, ''))}
            invalid={!!errorPincode}
            placeholder="626123"
            className="font-mono"
          />
        </FormField>

        <FormField
          htmlFor="stall-radius"
          label="Doorstep Radius (km) *"
          hint="Max dispatch range"
        >
          <Input
            id="stall-radius"
            type="number"
            min={1}
            max={30}
            value={serviceRadiusKm}
            onChange={(e) => onChange('serviceRadiusKm', Number(e.target.value) || 8)}
            placeholder="8"
          />
        </FormField>

        <div className="col-span-full">
          <FormField htmlFor="stall-line1" label="Door No & Street Address *" error={errorLine1}>
            <Input
              id="stall-line1"
              value={line1}
              onChange={(e) => onChange('line1', e.target.value)}
              invalid={!!errorLine1}
              placeholder="e.g. 42/B, Periyakulam Main Road, Near Market Entrance Gate"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
