import { Shield, ShieldAlert, Users, Pencil, Send, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, LoaderState } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { AdminUser } from '../api';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onEditUser: (user: AdminUser) => void;
  onReinviteUser: (user: AdminUser) => void;
  onRevokeUser: (user: AdminUser) => void;
  onAssignRole: (user: AdminUser) => void;
}

export function UsersTable({
  users,
  isLoading,
  isError,
  onRetry,
  onEditUser,
  onReinviteUser,
  onRevokeUser,
  onAssignRole,
}: UsersTableProps) {
  if (isLoading) {
    return <LoaderState title="Loading users..." description="Fetching registered accounts" />;
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-md space-y-3 bg-surface">
        <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
        <p className="text-sm font-semibold text-text">Admin Authentication Required</p>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Please sign in with your administrative account to query user records.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>Retry Query</Button>
          )}
          <Link to={ROUTES.LOGIN}><Button variant="primary" size="sm">Go to Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2 bg-surface">
        <Users className="h-8 w-8 text-muted mx-auto" />
        <p className="text-sm font-medium text-text">No users found</p>
        <p className="text-xs text-muted">Try adjusting your search query or role filter.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted/80 border-b border-border text-muted text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">User Details</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Registered</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const isSuper = user.role === 'SUPER_ADMIN';
              const isSuspended = user.status === 'SUSPENDED';

              return (
                <tr key={user.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-sm text-text">{user.name || 'Virudhunagar User'}</p>
                    <p className="text-xs text-muted mt-0.5">{user.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-text text-sm">{user.phone || '—'}</td>
                  <td className="py-3.5 px-4"><UserRoleBadge role={user.role} /></td>
                  <td className="py-3.5 px-4"><UserStatusBadge status={user.status} /></td>
                  <td className="py-3.5 px-4 text-xs text-muted">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Button - Sky Blue */}
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        title="Edit user details and role"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                      >
                        <Pencil className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                        <span>Edit</span>
                      </button>

                      {/* Re-invite Button - Emerald Green */}
                      <button
                        type="button"
                        onClick={() => onReinviteUser(user)}
                        title="Send re-invitation & generate password link"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      >
                        <Send className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Re-invite</span>
                      </button>

                      {/* Assign Role - Amber Gold */}
                      <button
                        type="button"
                        onClick={() => onAssignRole(user)}
                        title="Change role permissions"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      >
                        <Shield className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span>Role</span>
                      </button>

                      {/* Revoke Button - Crimson Rose */}
                      {!isSuper && (
                        <button
                          type="button"
                          disabled={isSuspended}
                          onClick={() => onRevokeUser(user)}
                          title={isSuspended ? 'User already suspended' : 'Revoke user access & suspend account'}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                            isSuspended
                              ? 'bg-surface-muted text-muted border border-border cursor-not-allowed opacity-50'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <UserX className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                          <span>{isSuspended ? 'Revoked' : 'Revoke'}</span>
                        </button>
                      )}
                    </div>
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
