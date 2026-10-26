import { useState, useMemo } from 'react';
import { UserPlus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  useVendorStaff,
  useAddVendorStaff,
  useUpdateVendorStaff,
  useRemoveVendorStaff,
  type VendorStaffMember,
  type AddVendorStaffPayload,
  type UpdateVendorStaffPayload,
} from '../api';
import { StaffCard } from '../components/staff-card';
import { AddStaffModal } from '../components/add-staff-modal';
import { EditStaffModal } from '../components/edit-staff-modal';
import { ShopSwitcher } from '@/features/vendor-shops';

export function VendorStaffPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<VendorStaffMember | null>(null);

  const { data, isLoading } = useVendorStaff();
  const addMutation = useAddVendorStaff();
  const updateMutation = useUpdateVendorStaff();
  const removeMutation = useRemoveVendorStaff();

  const staffList = data?.staff || [];

  const filteredStaff = useMemo(() => {
    return staffList.filter((m) => {
      const query = search.toLowerCase();
      const matchesSearch = m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [staffList, search, statusFilter]);

  const handleToggleStatus = (member: VendorStaffMember) => {
    const nextStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateMutation.mutate({ id: member.id, data: { status: nextStatus } });
  };

  const handleRemove = (member: VendorStaffMember) => {
    if (window.confirm(`Are you sure you want to remove ${member.name} from this stall?`)) {
      removeMutation.mutate(member.id);
    }
  };

  const handleAddSubmit = (payload: AddVendorStaffPayload) => {
    addMutation.mutate(payload, {
      onSuccess: () => setIsAddOpen(false),
    });
  };

  const handleEditSubmit = (id: string, payload: UpdateVendorStaffPayload) => {
    updateMutation.mutate(
      { id, data: payload },
      { onSuccess: () => setEditingMember(null) },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-text">Stall Staff & Team Management</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Authorize butcher cutters, billing cashiers, and dispatch handlers for your stall
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ShopSwitcher />
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3 bg-surface border border-border rounded-md flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Tabs */}
        <div className="flex rounded-md border border-border p-0.5 bg-surface-muted">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? 'bg-surface text-text border border-border'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab === 'ALL' ? 'All Staff' : tab === 'ACTIVE' ? 'Active' : 'Suspended'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff name or email..."
            className="w-full pl-8 pr-3 py-1 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted">Loading stall staff team...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-12 text-center rounded-md border border-border bg-surface space-y-3">
          <Users className="h-10 w-10 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No staff members found</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or filter.'
              : 'Add your cutters and billing staff to let them handle incoming stall orders.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)} className="mt-2">
            <UserPlus className="h-4 w-4 mr-1" /> Add Staff Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              onEdit={(m) => setEditingMember(m)}
              onToggleStatus={handleToggleStatus}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddStaffModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
        isSubmitting={addMutation.isPending}
      />
      <EditStaffModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
