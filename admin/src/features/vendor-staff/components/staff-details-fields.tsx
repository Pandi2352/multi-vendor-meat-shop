import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormField, Input, fieldDescriptionId } from '@/components/ui';
import { DUTY_SUGGESTIONS } from '../constants';

interface StaffDetailsFieldsProps {
  fields: { name: UseFormRegisterReturn; phone: UseFormRegisterReturn; dutyTitle: UseFormRegisterReturn };
  errors: { name?: string; phone?: string; dutyTitle?: string };
}

/** Name, mobile and job — shared by the invite and edit dialogs. */
export function StaffDetailsFields({ fields, errors }: StaffDetailsFieldsProps) {
  return (
    <>
      <FormField htmlFor="staff-name" label="Name" error={errors.name}>
        <Input
          id="staff-name"
          autoComplete="name"
          placeholder="e.g. Senthil Kumar"
          invalid={Boolean(errors.name)}
          aria-describedby={fieldDescriptionId('staff-name')}
          {...fields.name}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField htmlFor="staff-phone" label="Mobile (optional)" error={errors.phone}>
          <Input
            id="staff-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            invalid={Boolean(errors.phone)}
            aria-describedby={fieldDescriptionId('staff-phone')}
            {...fields.phone}
          />
        </FormField>
        <FormField htmlFor="staff-duty" label="Job (optional)" error={errors.dutyTitle}>
          <Input
            id="staff-duty"
            list="staff-duty-suggestions"
            placeholder="e.g. Master cutter"
            invalid={Boolean(errors.dutyTitle)}
            aria-describedby={fieldDescriptionId('staff-duty')}
            {...fields.dutyTitle}
          />
          <datalist id="staff-duty-suggestions">
            {DUTY_SUGGESTIONS.map((duty) => (
              <option key={duty} value={duty} />
            ))}
          </datalist>
        </FormField>
      </div>
    </>
  );
}
