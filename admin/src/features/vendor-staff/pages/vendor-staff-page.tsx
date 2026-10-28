import { useState } from 'react';
import { MailPlus, UserPlus, Users } from 'lucide-react';
import { Alert, Button, Dialog, ErrorState, LoaderState, Panel } from '@/components/ui';
import { InvitationResult } from '@/features/users';
import { ShopSwitcher } from '@/features/vendor-shops';
import { getErrorMessage } from '@/lib/api-error';
import { useVendorStaff, type VendorStaffMember } from '../api';
import { EditStaffDialog } from '../components/edit-staff-dialog';
import { InviteStaffDialog } from '../components/invite-staff-dialog';
import { PendingInviteRow } from '../components/pending-invite-row';
import { StaffConfirmDialog } from '../components/staff-confirm-dialog';
import { TeamMemberRow } from '../components/team-member-row';
import { useStaffActions } from '../hooks/use-staff-actions';

/** The shop owner's team: who works here, who's been invited, and changes to both. */
export function VendorStaffPage() {
  const { data, isLoading, isError, error, refetch } = useVendorStaff();
  const actions = useStaffActions();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<VendorStaffMember | null>(null);

  if (isLoading) return <LoaderState title="Loading your team…" />;
  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn’t load your team"
        description={getErrorMessage(error)}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  const staffCount = data.staff.filter((m) => m.role === 'VENDOR_STAFF').length;
  const inviteButton = (
    <Button size="sm" onClick={() => setInviteOpen(true)} leftIcon={<UserPlus className="h-4 w-4" />}>
      Invite staff
    </Button>
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-text">Stall team</h1>
          <p className="text-sm text-muted">
            Staff can take orders and record stock. Products, prices, payouts and the team stay with you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShopSwitcher />
          {inviteButton}
        </div>
      </header>

      {actions.resendError && (
        <Alert tone="danger" title="Couldn’t resend the invite">
          {actions.resendError}
        </Alert>
      )}

      <Panel title="Team" description={`${staffCount} ${staffCount === 1 ? 'staff member' : 'staff members'}`} icon={Users} flush>
        <ul className="divide-y divide-border">
          {data.staff.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onEdit={setEditing}
              onToggleSuspend={actions.toggleSuspend}
              onRemove={(m) => actions.askToConfirm({ kind: 'remove', member: m })}
            />
          ))}
        </ul>
        {staffCount === 0 && (
          <div className="flex flex-col items-center gap-3 border-t border-border px-4 py-8 text-center">
            <p className="text-sm text-muted">No staff yet. Invite your cutters and counter staff so they can handle orders.</p>
            {inviteButton}
          </div>
        )}
      </Panel>

      {data.invitations.length > 0 && (
        <Panel title="Waiting to join" description="Invited, but no password set yet" icon={MailPlus} flush>
          <ul className="divide-y divide-border">
            {data.invitations.map((invitation) => (
              <PendingInviteRow
                key={invitation.id}
                invitation={invitation}
                resending={actions.resendingId === invitation.id}
                onResend={(inv) => void actions.resendInvite(inv)}
                onCancel={(inv) => actions.askToConfirm({ kind: 'cancel', invitation: inv })}
              />
            ))}
          </ul>
        </Panel>
      )}

      <InviteStaffDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <EditStaffDialog member={editing} onClose={() => setEditing(null)} />
      <StaffConfirmDialog
        confirm={actions.confirm}
        onConfirm={() => void actions.runConfirm()}
        onClose={actions.closeConfirm}
        busy={actions.confirmBusy}
        error={actions.confirmError}
      />
      <Dialog open={Boolean(actions.resent)} onClose={actions.closeResent} title="Invite sent again">
        <div className="space-y-4 px-5 py-4">
          {actions.resent && <InvitationResult invitation={actions.resent} />}
          <div className="flex justify-end border-t border-border pt-3">
            <Button size="sm" onClick={actions.closeResent}>
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
