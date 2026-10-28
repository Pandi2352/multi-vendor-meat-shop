import { ShieldCheck, FileCheck } from 'lucide-react';
import { FormField, Input } from '@/components/ui';

interface ComplianceCardProps {
  fssaiNumber: string;
  municipalPermitNumber?: string;
  errorFssai?: string;
  onChange: (key: 'fssaiNumber' | 'municipalPermitNumber', val: string) => void;
}

/** Category 3: Food Safety & Municipal Compliance */
export function VendorFormComplianceCard({
  fssaiNumber,
  municipalPermitNumber = '',
  errorFssai,
  onChange,
}: ComplianceCardProps) {
  return (
    <div className="p-5 md:p-6 rounded-md bg-surface border border-border space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Food Safety & Municipal Compliance</h2>
          <p className="text-xs text-muted">Statutory butchery permits required under FSSAI Regulations and Municipal Corporation Bylaws</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          htmlFor="stall-fssai"
          label="FSSAI Registration Number (14 Digits) *"
          hint="Mandatory Food Safety and Standards Authority of India license"
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
          label="Municipal Trade Permit / Sanitary License"
          hint="Optional local corporation or town panchayat license number"
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

      <div className="p-3 rounded-md bg-surface-muted/50 border border-border flex items-center gap-2 text-xs text-muted">
        <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>FSSAI certificates are validated before stalls can publish poultry, goat or fish cuts for public retail.</span>
      </div>
    </div>
  );
}
