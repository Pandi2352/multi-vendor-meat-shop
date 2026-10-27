import { useState } from 'react';
import { RotateCw, Trash2, Mail, Link2, Check, Pencil } from 'lucide-react';
import { LoaderState } from '@/components/ui';
import { useResendInvitation, useRevokeInvitation, type UserInvitation } from '../api';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';

interface InvitationsTableProps {
  invitations: UserInvitation[];
  isLoading: boolean;
  onEditInvitation?: (inv: UserInvitation) => void;
}

export function InvitationsTable({ invitations, isLoading, onEditInvitation }: InvitationsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // One-time links returned by Resend in this session (the server never lists them).
  const [freshLinks, setFreshLinks] = useState<Record<string, string>>({});
  const revokeMutation = useRevokeInvitation();
  const resendMutation = useResendInvitation();

  const handleCopyLink = (inv: UserInvitation) => {
    const url = freshLinks[inv.id];
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(inv.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (isLoading) {
    return <LoaderState title="Loading invitations..." description="Retrieving workspace invitations" />;
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
          <tbody className="divide-y border-border">
            {invitations.map((inv) => {
              const isPending = inv.status === 'PENDING';
              const isCopied = copiedId === inv.id;

              return (
                <tr key={inv.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-sm text-text">{inv.name || 'Invited Member'}</p>
                    <p className="text-xs text-muted mt-0.5">{inv.email}</p>
                  </td>
                  <td className="py-3.5 px-4"><UserRoleBadge role={inv.role} /></td>
                  <td className="py-3.5 px-4"><UserStatusBadge status={inv.status} /></td>
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
                        {/* Copy Link - Purple */}
                        {freshLinks[inv.id] && (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv)}
                            title="Copy the link from the invitation you just re-sent"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                          >
                            {isCopied ? (
                              <Check className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            ) : (
                              <Link2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                            )}
                            <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                          </button>
                        )}

                        {/* Edit Invitation - Sky Blue */}
                        {onEditInvitation && (
                          <button
                            type="button"
                            onClick={() => onEditInvitation(inv)}
                            title="Edit invited name or role"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                          >
                            <Pencil className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* Re-invite / Resend - Emerald Green */}
                        <button
                          type="button"
                          disabled={resendMutation.isPending}
                          onClick={() =>
                            resendMutation.mutate(inv.id, {
                              onSuccess: (sent) => {
                                if (sent.inviteUrl) setFreshLinks((prev) => ({ ...prev, [inv.id]: sent.inviteUrl! }));
                              },
                            })
                          }
                          title="Extend invitation validity by 7 days"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        >
                          <RotateCw className={`h-3 w-3 text-emerald-600 dark:text-emerald-400 ${resendMutation.isPending ? 'animate-spin' : ''}`} />
                          <span>Re-invite</span>
                        </button>

                        {/* Revoke Invitation - Crimson Rose */}
                        <button
                          type="button"
                          disabled={revokeMutation.isPending}
                          onClick={() => revokeMutation.mutate(inv.id)}
                          title="Revoke this onboarding invitation"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                        >
                          <Trash2 className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                          <span>Revoke</span>
                        </button>
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
