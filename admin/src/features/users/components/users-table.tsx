import { Shield, ShieldAlert, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { AdminUser } from '../api';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onAssignRole: (user: AdminUser) => void;
  onUpdateStatus: (user: AdminUser) => void;
}

export function UsersTable({
  users,
  isLoading,
  isError,
  onRetry,
  onAssignRole,
  onUpdateStatus,
}: UsersTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-xs text-muted">Loading registered users...</div>;
  }

  if (isError) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-md space-y-3 bg-surface">
        <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
        <p className="text-sm font-semibold text-text">Admin Authentication Required</p>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Please sign in with your administrative account (admin@virudhunagar-meats.in) to query user records.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry Query
            </Button>
          )}
          <Link to={ROUTES.LOGIN}>
            <Button variant="primary" size="sm">Go to Sign In</Button>
          </Link>
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
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-muted border-b border-border text-muted font-medium">
            <tr>
              <th className="py-2.5 px-3">User Details</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Registered</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-muted/50 transition-colors">
                <td className="py-2.5 px-3">
                  <p className="font-semibold text-text">{user.name || 'Virudhunagar User'}</p>
                  <p className="text-[11px] text-muted">{user.email}</p>
                </td>
                <td className="py-2.5 px-3 text-muted">
                  {user.phone || '—'}
                </td>
                <td className="py-2.5 px-3">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="py-2.5 px-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="py-2.5 px-3 text-muted">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Shield className="h-3 w-3 text-primary" />}
                      onClick={() => onAssignRole(user)}
                    >
                      Assign Role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<UserCheck className="h-3 w-3" />}
                      onClick={() => onUpdateStatus(user)}
                    >
                      Status
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
