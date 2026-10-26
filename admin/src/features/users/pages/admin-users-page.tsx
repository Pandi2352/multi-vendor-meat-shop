import { useState } from 'react';
import { Users, UserPlus, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  useAdminUsers,
  useUserInvitations,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from '../api';
import { UsersTable } from '../components/users-table';
import { InvitationsTable } from '../components/invitations-table';
import { RolePermissionMatrix } from '../components/role-permission-matrix';
import { AssignRoleDialog } from '../components/assign-role-dialog';
import { UserStatusDialog } from '../components/user-status-dialog';
import { InviteUserModal } from '../components/invite-user-modal';

type Tab = 'USERS' | 'INVITATIONS' | 'ROLES';

const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Operations', value: 'OPERATIONS' },
  { label: 'Finance', value: 'FINANCE' },
  { label: 'Vendor Owner', value: 'VENDOR_OWNER' },
  { label: 'Butcher Staff', value: 'BUTCHER' },
  { label: 'Delivery Partner', value: 'DELIVERY_PARTNER' },
  { label: 'Customer', value: 'CUSTOMER' },
];

export function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>('USERS');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [assignRoleTarget, setAssignRoleTarget] = useState<AdminUser | null>(null);
  const [updateStatusTarget, setUpdateStatusTarget] = useState<AdminUser | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useAdminUsers({
    q: search || undefined,
    role: (selectedRole as UserRole) || undefined,
    status: (selectedStatus as UserStatus) || undefined,
  });

  const { data: invitations, isLoading: isInvitesLoading } = useUserInvitations();

  const users = usersData?.items || [];
  const inviteList = invitations || [];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Management & Access Control
          </h1>
          <p className="text-xs text-muted">
            Manage Virudhunagar platform users, role assignments, invitations and granular permissions.
          </p>
        </div>
        {tab === 'INVITATIONS' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsInviteOpen(true)}
          >
            Invite User
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setTab('USERS')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            tab === 'USERS' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text hover:bg-surface-muted'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          All Users ({usersData?.meta?.total ?? users.length})
        </button>
        <button
          onClick={() => setTab('INVITATIONS')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            tab === 'INVITATIONS' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text hover:bg-surface-muted'
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Invited Users ({inviteList.length})
        </button>
        <button
          onClick={() => setTab('ROLES')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            tab === 'ROLES' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text hover:bg-surface-muted'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Roles & Permissions Matrix
        </button>
      </div>

      {tab === 'USERS' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-surface border border-border rounded-md text-text w-full sm:w-auto"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-surface border border-border rounded-md text-text w-full sm:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <UsersTable
            users={users}
            isLoading={isUsersLoading}
            isError={isUsersError}
            onRetry={() => { void refetchUsers(); }}
            onAssignRole={(user) => setAssignRoleTarget(user)}
            onUpdateStatus={(user) => setUpdateStatusTarget(user)}
          />
        </div>
      )}

      {tab === 'INVITATIONS' && (
        <InvitationsTable invitations={inviteList} isLoading={isInvitesLoading} />
      )}

      {tab === 'ROLES' && <RolePermissionMatrix />}

      <AssignRoleDialog
        user={assignRoleTarget}
        onClose={() => setAssignRoleTarget(null)}
      />

      <UserStatusDialog
        user={updateStatusTarget}
        onClose={() => setUpdateStatusTarget(null)}
      />

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}
