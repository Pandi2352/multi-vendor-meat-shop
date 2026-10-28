import { UserCheck, Lock, Clock, Mail, CheckCircle2 } from 'lucide-react';
import { FormField, Input } from '@/components/ui';

interface CredentialsScheduleProps {
  ownerName: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  isEdit?: boolean;
  errorOwnerName?: string;
  errorPhone?: string;
  errorEmail?: string;
  errorTiming?: string;
  onChange: (key: 'ownerName' | 'phone' | 'email' | 'openingTime' | 'closingTime', val: string) => void;
}

/** Owner Credentials & Operating Hours - Dense 3-column rows with zero empty spaces */
export function VendorFormCredentialsScheduleCard({
  ownerName,
  phone,
  email,
  openingTime,
  closingTime,
  isEdit = false,
  errorOwnerName,
  errorPhone,
  errorEmail,
  errorTiming,
  onChange,
}: CredentialsScheduleProps) {
  return (
    <div className="p-4 md:p-5 rounded-md bg-surface border border-border space-y-3.5">
      <div className="flex items-center gap-2 pb-2.5 border-b border-border">
        <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <UserCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Owner Credentials & Operating Hours</h2>
          <p className="text-[11px] text-muted">Proprietor login access for Vendor Dashboard and daily butcher opening hours</p>
        </div>
      </div>

      {/* Row 1: 3 Columns for Owner Credentials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <FormField
          htmlFor="stall-owner-name"
          label="Owner Full Name *"
          hint="Proprietor contact"
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
          hint="Dispatch contact"
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
          hint={isEdit ? 'Immutable account ID' : 'Password setup link sent here'}
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

        {/* Row 2: Opening Time, Closing Time, and Timing Status Strip */}
        <FormField
          htmlFor="stall-opening-time"
          label="Opening Time (Morning) *"
          hint="Early dressed cuts ready"
        >
          <Input
            id="stall-opening-time"
            type="time"
            value={openingTime}
            onChange={(e) => onChange('openingTime', e.target.value)}
          />
        </FormField>

        <FormField
          htmlFor="stall-closing-time"
          label="Closing Time (Evening) *"
          hint="Order cutoff hour"
          error={errorTiming}
        >
          <Input
            id="stall-closing-time"
            type="time"
            value={closingTime}
            onChange={(e) => onChange('closingTime', e.target.value)}
            invalid={!!errorTiming}
          />
        </FormField>

        {/* Third column fills row 2 cleanly */}
        <div className="p-3 rounded-md bg-surface-muted/60 border border-border flex flex-col justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Daily Sunrise Schedule</span>
          </div>
          <p className="text-[11px] text-muted leading-tight">
            Operating from <strong className="text-text">{openingTime || '06:00'}</strong> to <strong className="text-text">{closingTime || '21:00'}</strong>. Orders placed in this window are auto-routed for doorstep delivery.
          </p>
        </div>
      </div>

      {/* Workflow Explanatory Notice */}
      <div className="p-3 rounded-md bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs">
        <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-text flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {isEdit
              ? 'Vendor Dashboard Account Active'
              : 'Automatic Credential Dispatch & First-Time Password Setup'}
          </p>
          <p className="text-muted text-[11px] leading-relaxed">
            {isEdit
              ? 'The vendor signs into /vendor with this email to manage live meat products, stock cuts, and fulfill incoming orders.'
              : 'Saving this stall emails an invitation link to the owner. On first login, they are prompted to set their password, then immediately access the Vendor Dashboard to add products.'}
          </p>
        </div>
      </div>
    </div>
  );
}
