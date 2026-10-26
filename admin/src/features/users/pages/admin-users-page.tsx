import { useState } from 'react';
import { Users, UserPlus, MailCheck, ShieldCheck } from 'lucide-react';
import {
  Button,
  SearchInput,
  CustomSelect,
  Tabs,
  Pagination,
  type TabItem,
  type SelectOption,
} from '@/components/ui';
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

const ROLE_OPTIONS: SelectOption[] = [
  { label: 'All Roles', value: '' },
  { label: 'Super Admin', value: 'SUPER_ADMIN', description: 'Platform creator & root access' },
  { label: 'Admin', value: 'ADMIN', description: 'Operations & user manager' },
  { label: 'Operations Staff', value: 'OPERATIONS', description: 'Catalog & stall verifications' },
  { label: 'Finance Manager', value: 'FINANCE', description: 'Ledger, settlements & payouts' },
  { label: 'Customer Support', value: 'SUPPORT', description: 'Support tickets & reviews' },
  { label: 'Stall Owner', value: 'VENDOR_OWNER', description: 'Butcher shop manager' },
  { label: 'Stall Staff / Butcher', value: 'VENDOR_STAFF', description: 'Meat preparation & cutting' },
  { label: 'Delivery Partner', value: 'DELIVERY_PARTNER', description: 'Order pickups & logistics' },
  { label: 'Customer', value: 'CUSTOMER', description: 'Storefront consumer account' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE', description: 'Normal account standing' },
  { label: 'Inactive', value: 'INACTIVE', description: 'Account not active' },
  { label: 'Suspended', value: 'SUSPENDED', description: 'Temporary lock or penalty' },
];

export function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>('USERS');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [assignRoleTarget, setAssignRoleTarget] = useState<AdminUser | null>(null);
  const [updateStatusTarget, setUpdateStatusTarget] = useState<AdminUser | null>(null);
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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleRoleChange = (val: string) => {
    setSelectedRole(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setPage(1);
  };

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

      {/* Light-color, professional compact tabs */}
      <div className="flex items-center justify-between">
        <Tabs<Tab>
          tabs={tabItems}
          activeTab={tab}
          onChange={setTab}
        />
      </div>

      {/* Tab 1: All Users */}
      {tab === 'USERS' && (
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex-1 w-full">
              <SearchInput
                value={search}
                onChange={handleSearchChange}
                placeholder="Search users by name, email, or phone number..."
              />
            </div>
            <div className="w-full sm:w-56">
              <CustomSelect
                value={selectedRole}
                onChange={(val) => handleRoleChange(val as string)}
                options={ROLE_OPTIONS}
                searchable
                clearable
                placeholder="Filter by Role..."
              />
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect
                value={selectedStatus}
                onChange={(val) => handleStatusChange(val as string)}
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
            onAssignRole={(user) => setAssignRoleTarget(user)}
            onUpdateStatus={(user) => setUpdateStatusTarget(user)}
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

      {/* Tab 2: Invitations */}
      {tab === 'INVITATIONS' && (
        <InvitationsTable invitations={inviteList} isLoading={isInvitesLoading} />
      )}

      {/* Tab 3: Roles & Permissions Matrix */}
      {tab === 'ROLES' && <RolePermissionMatrix />}

      {/* Modals and Dialogs */}
      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <AssignRoleDialog
        user={assignRoleTarget}
        onClose={() => setAssignRoleTarget(null)}
      />

      <UserStatusDialog
        user={updateStatusTarget}
        onClose={() => setUpdateStatusTarget(null)}
      />
    </div>
  );
}
