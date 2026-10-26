import { useState } from 'react';
import { Users, UserPlus, MailCheck, ShieldCheck } from 'lucide-react';
import {
  Button,
  SearchInput,
  CustomSelect,
  Tabs,
  Pagination,
  type TabItem,
} from '@/components/ui';
import {
  useAdminUsers,
  useUserInvitations,
  type AdminUser,
  type UserInvitation,
  type UserRole,
  type UserStatus,
} from '../api';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../constants';
import { UsersTable } from '../components/users-table';
import { InvitationsTable } from '../components/invitations-table';
import { RolePermissionMatrix } from '../components/role-permission-matrix';
import { AssignRoleDialog } from '../components/assign-role-dialog';
import { InviteUserModal } from '../components/invite-user-modal';
import { EditUserModal } from '../components/edit-user-modal';
import { RevokeUserDialog } from '../components/revoke-user-dialog';
import { ReinviteUserDialog } from '../components/reinvite-user-dialog';
import { EditInvitationModal } from '../components/edit-invitation-modal';

type Tab = 'USERS' | 'INVITATIONS' | 'ROLES';

export function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>('USERS');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editUserTarget, setEditUserTarget] = useState<AdminUser | null>(null);
  const [reinviteUserTarget, setReinviteUserTarget] = useState<AdminUser | null>(null);
  const [revokeUserTarget, setRevokeUserTarget] = useState<AdminUser | null>(null);
  const [assignRoleTarget, setAssignRoleTarget] = useState<AdminUser | null>(null);
  const [editInvitationTarget, setEditInvitationTarget] = useState<UserInvitation | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useAdminUsers({
    page,
    limit,
    q: search || undefined,
    role: (selectedRole as UserRole) || undefined,
    status: (selectedStatus as UserStatus) || undefined,
  });

  const { data: invitations, isLoading: isInvitesLoading } = useUserInvitations();

  const users = usersData?.items || [];
  const inviteList = invitations || [];

  const tabItems: TabItem<Tab>[] = [
    {
      key: 'USERS',
      label: 'All Users',
      icon: Users,
      count: usersData?.meta?.total ?? users.length,
    },
    {
      key: 'INVITATIONS',
      label: 'Invited Users',
      icon: MailCheck,
      count: inviteList.length,
    },
    {
      key: 'ROLES',
      label: 'Roles & Permissions',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Management & Access Control
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage Virudhunagar platform users, role assignments, invitations and granular permissions.
          </p>
        </div>
        {tab === 'INVITATIONS' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
            onClick={() => setIsInviteOpen(true)}
          >
            Invite User
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Tabs<Tab> tabs={tabItems} activeTab={tab} onChange={setTab} />
      </div>

      {tab === 'USERS' && (
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex-1 w-full">
              <SearchInput
                value={search}
                onChange={(val) => { setSearch(val); setPage(1); }}
                placeholder="Search users by name, email, or phone number..."
              />
            </div>
            <div className="w-full sm:w-56">
              <CustomSelect
                value={selectedRole}
                onChange={(val) => { setSelectedRole(val as string); setPage(1); }}
                options={ROLE_OPTIONS}
                searchable
                clearable
                placeholder="Filter by Role..."
              />
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect
                value={selectedStatus}
                onChange={(val) => { setSelectedStatus(val as string); setPage(1); }}
                options={STATUS_OPTIONS}
                searchable
                clearable
                placeholder="Filter by Status..."
              />
            </div>
          </div>

          <UsersTable
            users={users}
            isLoading={isUsersLoading}
            isError={isUsersError}
            onRetry={() => { void refetchUsers(); }}
            onEditUser={(user) => setEditUserTarget(user)}
            onReinviteUser={(user) => setReinviteUserTarget(user)}
            onRevokeUser={(user) => setRevokeUserTarget(user)}
            onAssignRole={(user) => setAssignRoleTarget(user)}
          />

          <Pagination
            page={page}
            totalPages={usersData?.meta?.totalPages || 1}
            totalItems={usersData?.meta?.total ?? users.length}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}

      {tab === 'INVITATIONS' && (
        <InvitationsTable
          invitations={inviteList}
          isLoading={isInvitesLoading}
          onEditInvitation={(inv) => setEditInvitationTarget(inv)}
        />
      )}

      {tab === 'ROLES' && <RolePermissionMatrix />}

      {/* Action Dialogs & Modals */}
      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <EditUserModal user={editUserTarget} onClose={() => setEditUserTarget(null)} />

      <ReinviteUserDialog user={reinviteUserTarget} onClose={() => setReinviteUserTarget(null)} />

      <RevokeUserDialog user={revokeUserTarget} onClose={() => setRevokeUserTarget(null)} />

      <AssignRoleDialog user={assignRoleTarget} onClose={() => setAssignRoleTarget(null)} />

      <EditInvitationModal
        invitation={editInvitationTarget}
        onClose={() => setEditInvitationTarget(null)}
      />
    </div>
  );
}
