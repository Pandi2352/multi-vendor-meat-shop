import { Clock, AlertCircle, Info } from 'lucide-react';
import { FormField, Input } from '@/components/ui';

interface ScheduleCardProps {
  openingTime: string;
  closingTime: string;
  errorTiming?: string;
  onChange: (key: 'openingTime' | 'closingTime', val: string) => void;
}

/** Category 5: Operating Schedule */
export function VendorFormScheduleCard({
  openingTime,
  closingTime,
  errorTiming,
  onChange,
}: ScheduleCardProps) {
  return (
    <div className="p-5 md:p-6 rounded-md bg-surface border border-border space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text">Operating Schedule & Dispatch Hours</h2>
          <p className="text-xs text-muted">Daily stall opening hours during which doorstep delivery orders are accepted and prepared</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          htmlFor="stall-opening-time"
          label="Opening Time (Morning) *"
          hint="Stall open & dressed meat ready for dispatch"
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
          hint="Daily order cutoff and shutter time"
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
      </div>

      {errorTiming && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorTiming}</span>
        </div>
      )}

      <div className="p-3 rounded-md bg-surface-muted/50 border border-border flex items-center gap-2 text-xs text-muted">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <span>Early morning slots (06:00 - 08:30) enable same-day sunrise delivery for country chicken and tender mutton.</span>
      </div>
    </div>
  );
}
