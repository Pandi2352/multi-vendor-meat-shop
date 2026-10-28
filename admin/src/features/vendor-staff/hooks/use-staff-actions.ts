import { useState } from 'react';
import { getErrorMessage } from '@/lib/api-error';
import {
  useCancelStaffInvite,
  useRemoveStaff,
  useResendStaffInvite,
  useUpdateStaff,
  type StaffInvitation,
  type VendorStaffMember,
} from '../api';

export type StaffConfirm =
  | { kind: 'remove'; member: VendorStaffMember }
  | { kind: 'suspend'; member: VendorStaffMember }
  | { kind: 'cancel'; invitation: StaffInvitation };

/** State and handlers behind the team page's confirm dialogs, resend and suspend. */
export const useStaffActions = () => {
  const update = useUpdateStaff();
  const remove = useRemoveStaff();
  const resend = useResendStaffInvite();
  const cancel = useCancelStaffInvite();

  const [confirm, setConfirm] = useState<StaffConfirm | null>(null);
  const [resent, setResent] = useState<StaffInvitation | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const running = confirm?.kind === 'remove' ? remove : confirm?.kind === 'cancel' ? cancel : update;

  const closeConfirm = () => {
    remove.reset();
    cancel.reset();
    update.reset();
    setConfirm(null);
  };

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === 'remove') await remove.mutateAsync(confirm.member.id);
      if (confirm.kind === 'cancel') await cancel.mutateAsync(confirm.invitation.id);
      if (confirm.kind === 'suspend') await update.mutateAsync({ id: confirm.member.id, data: { status: 'SUSPENDED' } });
      closeConfirm();
    } catch {
      // Shown in the dialog via `confirmError`.
    }
  };

  /** Suspending asks first; re-activating doesn't. */
  const toggleSuspend = (member: VendorStaffMember) => {
    if (member.status === 'SUSPENDED') update.mutate({ id: member.id, data: { status: 'ACTIVE' } });
    else setConfirm({ kind: 'suspend', member });
  };

  const resendInvite = async (invitation: StaffInvitation) => {
    setResendingId(invitation.id);
    try {
      setResent(await resend.mutateAsync(invitation.id));
    } catch {
      // Shown on the page via `resendError`.
    } finally {
      setResendingId(null);
    }
  };

  return {
    confirm,
    askToConfirm: setConfirm,
    closeConfirm,
    runConfirm,
    confirmBusy: running.isPending,
    confirmError: running.isError ? getErrorMessage(running.error) : null,
    toggleSuspend,
    resendInvite,
    resendingId,
    resendError: resend.isError ? getErrorMessage(resend.error) : null,
    resent,
    closeResent: () => setResent(null),
  };
};
