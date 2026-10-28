import { Store } from 'lucide-react';
import { FormField, Input } from '@/components/ui';

interface IdentityCardProps {
  shopName: string;
  shopNameTa: string;
  fssaiNumber: string;
  municipalPermitNumber?: string;
  errorShopName?: string;
  errorFssai?: string;
  onChange: (key: 'shopName' | 'shopNameTa' | 'fssaiNumber' | 'municipalPermitNumber', val: string) => void;
}

/** Stall Brand Identity & Food Safety Compliance - Dense 4-column row layout with zero empty spaces */
export function VendorFormIdentityCard({
  shopName,
  shopNameTa,
  fssaiNumber,
  municipalPermitNumber = '',
  errorShopName,
  errorFssai,
  onChange,
}: IdentityCardProps) {
  return (
    <div className="p-4 md:p-5 rounded-md bg-surface border border-border space-y-3.5">
      <div className="flex items-center gap-2 pb-2.5 border-b border-border">
        <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <Store className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Stall & Statutory Compliance</h2>
          <p className="text-[11px] text-muted">Shop trade identity, Tamil signage, and mandatory FSSAI food safety license</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <FormField
          htmlFor="stall-shop-name"
          label="Shop Name (English) *"
          hint="Registered trade name"
          error={errorShopName}
        >
          <Input
            id="stall-shop-name"
            value={shopName}
            onChange={(e) => onChange('shopName', e.target.value)}
            invalid={!!errorShopName}
            placeholder="e.g. Sivakasi Fresh Mutton"
          />
        </FormField>

        <FormField
          htmlFor="stall-shop-name-ta"
          label="Shop Name in Tamil / பெயர்"
          hint="Local language signage"
        >
          <Input
            id="stall-shop-name-ta"
            value={shopNameTa}
            onChange={(e) => onChange('shopNameTa', e.target.value)}
            placeholder="e.g. சிவகாசி பிரஷ் மட்டன்"
          />
        </FormField>

        <FormField
          htmlFor="stall-fssai"
          label="FSSAI License (14 Digits) *"
          hint="Statutory food safety ID"
          error={errorFssai}
        >
          <Input
            id="stall-fssai"
            maxLength={14}
            value={fssaiNumber}
            onChange={(e) => onChange('fssaiNumber', e.target.value.replace(/\D/g, ''))}
            invalid={!!errorFssai}
            placeholder="12426008000456"
            className="font-mono"
          />
        </FormField>

        <FormField
          htmlFor="stall-municipal-permit"
          label="Municipal Trade Permit"
          hint="Town sanitary license (opt)"
        >
          <Input
            id="stall-municipal-permit"
            value={municipalPermitNumber}
            onChange={(e) => onChange('municipalPermitNumber', e.target.value)}
            placeholder="e.g. SVK/TRD/2026/8841"
            className="font-mono"
          />
        </FormField>
      </div>
    </div>
  );
}
