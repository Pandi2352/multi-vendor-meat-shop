import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Alert, Button, Dialog, FormField, Input, fieldDescriptionId } from '@/components/ui';
import { InvitationResult } from '@/features/users';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { useInviteStaff, type StaffInvitation } from '../api';
import { inviteStaffSchema, type InviteStaffValues } from '../schemas/staff.schema';
import { StaffDetailsFields } from './staff-details-fields';

interface InviteStaffDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Invite someone by email; then shows whether the email went out, with the one-time link. */
export function InviteStaffDialog({ open, onClose }: InviteStaffDialogProps) {
  const invite = useInviteStaff();
  const [issued, setIssued] = useState<StaffInvitation | null>(null);
  const form = useZodForm(inviteStaffSchema, { defaultValues: { name: '', email: '', phone: '', dutyTitle: '' } });
  const { errors } = form.formState;

  const close = () => {
    setIssued(null);
    form.reset();
    invite.reset();
    onClose();
  };

  const onSubmit = form.handleSubmit(async (values: InviteStaffValues) => {
    try {
      setIssued(await invite.mutateAsync({ ...values, dutyTitle: values.dutyTitle || undefined }));
    } catch (error) {
      applyServerErrors(error, form.setError, ['name', 'email', 'phone', 'dutyTitle']);
    }
  });

  const serverError = invite.isError && !Object.keys(errors).length ? getErrorMessage(invite.error) : null;

  return (
    <Dialog open={open} onClose={close} title={issued ? 'Invitation sent' : 'Invite a staff member'}>
      {issued ? (
        <div className="space-y-4 px-5 py-4">
          <InvitationResult invitation={issued} />
          <p className="text-xs text-muted">
            They’ll appear in your team once they set a password. Until then you can resend or cancel the invite.
          </p>
          <div className="flex justify-end border-t border-border pt-3">
            <Button size="sm" onClick={close}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="space-y-4 px-5 py-4">
          <p className="text-sm text-muted">
            We’ll email them a link to set a password. Staff can handle orders and stock; only you can change products,
            prices, payouts and the team.
          </p>
          {serverError && (
            <Alert tone="danger" title="Couldn’t send the invite">
              {serverError}
            </Alert>
          )}
          <FormField htmlFor="staff-email" label="Email" error={errors.email?.message}>
            <Input
              id="staff-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              spellCheck={false}
              placeholder="name@gmail.com"
              leftIcon={<Mail className="h-4 w-4" />}
              invalid={Boolean(errors.email)}
              aria-describedby={fieldDescriptionId('staff-email')}
              {...form.register('email')}
            />
          </FormField>
          <StaffDetailsFields
            fields={{ name: form.register('name'), phone: form.register('phone'), dutyTitle: form.register('dutyTitle') }}
            errors={{ name: errors.name?.message, phone: errors.phone?.message, dutyTitle: errors.dutyTitle?.message }}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={invite.isPending} leftIcon={!invite.isPending && <Send className="h-3.5 w-3.5" />}>
              Send invite
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
