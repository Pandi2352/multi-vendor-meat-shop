import { Shield, ShieldAlert, UserCheck, Users } from 'lucide-react';
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
    return (
      <LoaderState
        title="Loading users..."
        description="Fetching registered customer, vendor, and administrative accounts"
      />
    );
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-sm text-text">{user.name || 'Virudhunagar User'}</p>
                  <p className="text-xs text-muted mt-0.5">{user.email}</p>
                </td>
                <td className="py-3.5 px-4 text-text text-sm">
                  {user.phone || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="py-3.5 px-4">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="py-3.5 px-4 text-xs text-muted">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Shield className="h-3.5 w-3.5 text-primary" />}
                      onClick={() => onAssignRole(user)}
                    >
                      Assign Role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<UserCheck className="h-3.5 w-3.5 text-muted" />}
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
