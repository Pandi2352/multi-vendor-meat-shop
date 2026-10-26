import { RotateCw, Trash2, Mail } from 'lucide-react';
import { Button, LoaderState } from '@/components/ui';
import { useResendInvitation, useRevokeInvitation, type UserInvitation } from '../api';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';

interface InvitationsTableProps {
  invitations: UserInvitation[];
  isLoading: boolean;
}

export function InvitationsTable({ invitations, isLoading }: InvitationsTableProps) {
  const revokeMutation = useRevokeInvitation();
  const resendMutation = useResendInvitation();

  if (isLoading) {
    return (
      <LoaderState
        title="Loading invitations..."
        description="Retrieving pending and accepted workspace invitations"
      />
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2 bg-surface">
        <Mail className="h-8 w-8 text-muted mx-auto" />
        <p className="text-sm font-medium text-text">No invitations found</p>
        <p className="text-xs text-muted">Invite team members, butchers, or delivery partners to the portal.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted/80 border-b border-border text-muted text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Invited User</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Expires At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invitations.map((inv) => {
              const isPending = inv.status === 'PENDING';
              return (
                <tr key={inv.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-sm text-text">{inv.name || 'Invited Member'}</p>
                    <p className="text-xs text-muted mt-0.5">{inv.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <UserRoleBadge role={inv.role} />
                  </td>
                  <td className="py-3.5 px-4">
                    <UserStatusBadge status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {new Date(inv.expiresAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isPending && (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={resendMutation.isPending}
                          leftIcon={<RotateCw className="h-3 w-3" />}
                          onClick={() => resendMutation.mutate(inv.id)}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={revokeMutation.isPending}
                          leftIcon={<Trash2 className="h-3 w-3" />}
                          onClick={() => revokeMutation.mutate(inv.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
