import { UserCheck, Mail, Lock } from 'lucide-react';
import { FormField, Input } from '@/components/ui';

interface CredentialsCardProps {
  ownerName: string;
  phone: string;
  email: string;
  errorOwnerName?: string;
  errorPhone?: string;
  errorEmail?: string;
  isEdit?: boolean;
  onChange: (key: 'ownerName' | 'phone' | 'email', val: string) => void;
}

/** Category 2: Owner & Login Credentials for Vendor Dashboard */
export function VendorFormCredentialsCard({
  ownerName,
  phone,
  email,
  errorOwnerName,
  errorPhone,
  errorEmail,
  isEdit = false,
  onChange,
}: CredentialsCardProps) {
  return (
    <div className="p-5 md:p-6 rounded-md bg-surface border border-border space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Owner & Vendor Dashboard Credentials</h2>
          <p className="text-xs text-muted">Stall proprietor details used for administrative access and daily product management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          htmlFor="stall-owner-name"
          label="Owner Full Name *"
          hint="Name of proprietor or primary butchery contact"
          error={errorOwnerName}
        >
          <Input
            id="stall-owner-name"
            value={ownerName}
            onChange={(e) => onChange('ownerName', e.target.value)}
            invalid={!!errorOwnerName}
            placeholder="e.g. S. Murugesan"
          />
        </FormField>

        <FormField
          htmlFor="stall-phone"
          label="Contact Mobile (10-Digit) *"
          hint="Primary phone for delivery coordination"
          error={errorPhone}
        >
          <Input
            id="stall-phone"
            maxLength={10}
            value={phone}
            onChange={(e) => onChange('phone', e.target.value.replace(/\D/g, ''))}
            invalid={!!errorPhone}
            placeholder="9842012345"
          />
        </FormField>

        <FormField
          htmlFor="stall-email"
          label={isEdit ? 'Dashboard Login Email' : 'Login Email Address *'}
          hint={isEdit ? 'Registered account identifier' : 'Owner credentials & activation link sent here'}
          error={errorEmail}
        >
          <div className="relative">
            <Input
              id="stall-email"
              type="email"
              value={email}
              disabled={isEdit}
              onChange={(e) => onChange('email', e.target.value)}
              invalid={!!errorEmail}
              placeholder="owner@sivakasimeat.com"
              className={isEdit ? 'bg-surface-muted text-muted font-mono cursor-not-allowed pr-8' : ''}
            />
            {isEdit && (
              <Lock className="h-3.5 w-3.5 text-muted absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </FormField>
      </div>

      {/* Workflow Explanatory Notice */}
      <div className="p-3.5 rounded-md bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs">
        <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-text">
            {isEdit
              ? 'Vendor Dashboard Access Active'
              : 'Automatic Credential Dispatch & First-Time Password Setup'}
          </p>
          <p className="text-muted leading-relaxed">
            {isEdit
              ? 'The vendor signs in with this email to access the Vendor Dashboard, manage fresh cuts, set live kg pricing, and fulfill meat orders.'
              : 'When you save this stall, an invitation with a secure link will be emailed to the owner. On first login, they will be required to set their password. Once set, they can immediately log in to the Vendor Dashboard and add products.'}
          </p>
        </div>
      </div>
    </div>
  );
}
