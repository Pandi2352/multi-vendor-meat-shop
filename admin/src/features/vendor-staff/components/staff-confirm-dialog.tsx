import { ConfirmDialog } from '@/components/ui';
import type { StaffConfirm } from '../hooks/use-staff-actions';

interface StaffConfirmDialogProps {
  confirm: StaffConfirm | null;
  onConfirm: () => void;
  onClose: () => void;
  busy: boolean;
  error: string | null;
}

const copyFor = (confirm: StaffConfirm) => {
  if (confirm.kind === 'cancel') {
    const who = confirm.invitation.name || confirm.invitation.email;
    return {
      title: 'Cancel this invite?',
      label: 'Cancel invite',
      body: `The link we sent ${who} will stop working. You can invite them again later.`,
    };
  }
  const { name } = confirm.member;
  if (confirm.kind === 'suspend') {
    return {
      title: `Suspend ${name}?`,
      label: 'Suspend',
      body: `${name} is signed out and can’t use the portal until you re-activate them. Nothing is deleted.`,
    };
  }
  return {
    title: `Remove ${name} from your shop?`,
    label: 'Remove',
    body: `${name} loses access to your shop straight away. Their own account stays (they can still order as a customer), and you can invite them again later.`,
  };
};

/** The "are you sure?" step for removing, suspending, or cancelling an invite. */
export function StaffConfirmDialog({ confirm, onConfirm, onClose, busy, error }: StaffConfirmDialogProps) {
  const copy = confirm ? copyFor(confirm) : null;
  return (
    <ConfirmDialog
      open={Boolean(confirm)}
      title={copy?.title ?? ''}
      confirmLabel={copy?.label ?? 'Confirm'}
      tone={confirm?.kind === 'suspend' ? 'primary' : 'danger'}
      onConfirm={onConfirm}
      onClose={onClose}
      loading={busy}
      error={error}
    >
      <p>{copy?.body}</p>
    </ConfirmDialog>
  );
}
