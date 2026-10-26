import { useState } from 'react';
import { Plus, Store, CheckCircle, Clock, Ban } from 'lucide-react';
import { Button, LoaderState, Tabs, SearchInput, type TabItem } from '@/components/ui';
import { useAdminVendors, type VendorProfile, type VendorStatus } from '../api';
import { VendorCard } from '../components/vendor-card';
import { VendorVerifyDialog } from '../components/vendor-verify-dialog';
import { AddVendorModal } from '../components/add-vendor-modal';
import { StallDossierModal } from '../components/stall-dossier-modal';
import { StallPermissionsModal } from '../components/stall-permissions-modal';

type VendorTab = 'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED';

export function AdminVendorsPage() {
  const [tab, setTab] = useState<VendorTab>('ALL');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [dossierTarget, setDossierTarget] = useState<VendorProfile | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<VendorProfile | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<{
    vendor: VendorProfile;
    action: VendorStatus;
  } | null>(null);

  const { data, isLoading } = useAdminVendors();
  const allVendors = data?.items || [];

  const searchedVendors = allVendors.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.businessName.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.fssaiNumber.toLowerCase().includes(q) ||
      (v.shop?.city && v.shop.city.toLowerCase().includes(q))
    );
  });

  const filteredVendors = searchedVendors.filter((v) => {
    if (tab === 'PENDING') return v.status === 'SUBMITTED' || v.status === 'UNDER_REVIEW' || v.status === 'RESUBMISSION_REQUIRED';
    if (tab === 'APPROVED') return v.status === 'APPROVED';
    if (tab === 'SUSPENDED') return v.status === 'SUSPENDED';
    return true;
  });

  const pendingCount = allVendors.filter((v) => v.status === 'SUBMITTED' || v.status === 'UNDER_REVIEW' || v.status === 'RESUBMISSION_REQUIRED').length;
  const approvedCount = allVendors.filter((v) => v.status === 'APPROVED').length;
  const suspendedCount = allVendors.filter((v) => v.status === 'SUSPENDED').length;

  const tabItems: TabItem<VendorTab>[] = [
    { key: 'ALL', label: 'All Stalls', icon: Store, count: allVendors.length },
    { key: 'PENDING', label: 'Pending Review', icon: Clock, count: pendingCount, alert: pendingCount > 0 },
    { key: 'APPROVED', label: 'Active Stalls', icon: CheckCircle, count: approvedCount },
    { key: 'SUSPENDED', label: 'Suspended', icon: Ban, count: suspendedCount },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Butcher Stalls & Verification (விருதுநகர்)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Review FSSAI licences, municipal hygiene permits, approve stalls, and configure authorized meat cuts.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Butcher Stall
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Tabs<VendorTab> tabs={tabItems} activeTab={tab} onChange={setTab} />
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search stalls by name, owner, town, or FSSAI..."
          />
        </div>
      </div>

      {isLoading ? (
        <LoaderState
          title="Loading butcher stalls..."
          description="Fetching verified Virudhunagar stalls, documents, and category permissions"
        />
      ) : filteredVendors.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2 bg-surface">
          <Store className="h-8 w-8 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No stalls found</p>
          <p className="text-xs text-muted">
            {tab === 'PENDING'
              ? 'No pending verification requests at this time.'
              : tab === 'SUSPENDED'
              ? 'No stalls currently suspended.'
              : 'Add your first butcher stall or adjust your search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onOpenDossier={(v) => setDossierTarget(v)}
              onOpenPermissions={(v) => setPermissionsTarget(v)}
              onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
            />
          ))}
        </div>
      )}

      {/* Modals & Dialogs */}
      <AddVendorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <StallDossierModal
        vendor={dossierTarget}
        onClose={() => setDossierTarget(null)}
        onOpenPermissions={(v) => setPermissionsTarget(v)}
        onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
      />

      <StallPermissionsModal
        vendor={permissionsTarget}
        onClose={() => setPermissionsTarget(null)}
      />

      <VendorVerifyDialog
        vendor={verifyTarget?.vendor || null}
        action={verifyTarget?.action || null}
        onClose={() => setVerifyTarget(null)}
      />
    </div>
  );
}
