import { useEffect } from 'react';
import { Alert, Button, Dialog } from '@/components/ui';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { useUpdateStaff, type VendorStaffMember } from '../api';
import { editStaffSchema, type EditStaffValues } from '../schemas/staff.schema';
import { StaffDetailsFields } from './staff-details-fields';

interface EditStaffDialogProps {
  member: VendorStaffMember | null;
  onClose: () => void;
}

/** Change a staff member's name, mobile or job. */
export function EditStaffDialog({ member, onClose }: EditStaffDialogProps) {
  const update = useUpdateStaff();
  const form = useZodForm(editStaffSchema, { defaultValues: { name: '', phone: '', dutyTitle: '' } });
  const { errors } = form.formState;

  useEffect(() => {
    if (member) form.reset({ name: member.name, phone: member.phone ?? '', dutyTitle: member.dutyTitle ?? '' });
  }, [member, form]);

  const close = () => {
    update.reset();
    onClose();
  };

  const onSubmit = form.handleSubmit(async (values: EditStaffValues) => {
    if (!member) return;
    try {
      await update.mutateAsync({ id: member.id, data: { ...values, dutyTitle: values.dutyTitle ?? '' } });
      close();
    } catch (error) {
      applyServerErrors(error, form.setError, ['name', 'phone', 'dutyTitle']);
    }
  });

  const serverError = update.isError && !Object.keys(errors).length ? getErrorMessage(update.error) : null;

  return (
    <Dialog open={Boolean(member)} onClose={close} title={`Edit ${member?.name ?? 'staff member'}`}>
      <form noValidate onSubmit={onSubmit} className="space-y-4 px-5 py-4">
        <p className="text-sm text-muted">{member?.email}</p>
        {serverError && (
          <Alert tone="danger" title="Couldn’t save">
            {serverError}
          </Alert>
        )}
        <StaffDetailsFields
          fields={{ name: form.register('name'), phone: form.register('phone'), dutyTitle: form.register('dutyTitle') }}
          errors={{ name: errors.name?.message, phone: errors.phone?.message, dutyTitle: errors.dutyTitle?.message }}
        />
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={update.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
