import { useState } from 'react';
import { Plus, Store, CheckCircle, Clock } from 'lucide-react';
import { Button, LoaderState, Tabs, type TabItem } from '@/components/ui';
import { useAdminVendors, type VendorProfile } from '../api';
import { VendorCard } from '../components/vendor-card';
import { VendorVerifyDialog } from '../components/vendor-verify-dialog';
import { AddVendorModal } from '../components/add-vendor-modal';

type VendorTab = 'ALL' | 'PENDING' | 'APPROVED';

export function AdminVendorsPage() {
  const [tab, setTab] = useState<VendorTab>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<{
    vendor: VendorProfile;
    action: 'APPROVED' | 'REJECTED';
  } | null>(null);

  const { data, isLoading } = useAdminVendors();
  const allVendors = data?.items || [];

  const filteredVendors = allVendors.filter((v) => {
    if (tab === 'PENDING') return v.status === 'SUBMITTED' || v.status === 'UNDER_REVIEW';
    if (tab === 'APPROVED') return v.status === 'APPROVED';
    return true;
  });

  const pendingCount = allVendors.filter((v) => v.status === 'SUBMITTED' || v.status === 'UNDER_REVIEW').length;
  const approvedCount = allVendors.filter((v) => v.status === 'APPROVED').length;

  const tabItems: TabItem<VendorTab>[] = [
    {
      key: 'ALL',
      label: 'All Stalls',
      icon: Store,
      count: allVendors.length,
    },
    {
      key: 'PENDING',
      label: 'Pending Review',
      icon: Clock,
      count: pendingCount,
      alert: pendingCount > 0,
    },
    {
      key: 'APPROVED',
      label: 'Active Stalls',
      icon: CheckCircle,
      count: approvedCount,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Butcher Stalls & Vendors (விருதுநகர்)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage Virudhunagar district butcher stalls and review public onboarding applications.
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

      {/* Light-color, professional compact tabs */}
      <div className="flex items-center justify-between">
        <Tabs<VendorTab>
          tabs={tabItems}
          activeTab={tab}
          onChange={setTab}
        />
      </div>

      {isLoading ? (
        <LoaderState
          title="Loading butcher stalls..."
          description="Fetching verified Virudhunagar stalls and public applications"
        />
      ) : filteredVendors.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2 bg-surface">
          <Store className="h-8 w-8 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No stalls found</p>
          <p className="text-xs text-muted">
            {tab === 'PENDING'
              ? 'No pending verification requests at this time.'
              : 'Add your first butcher stall or wait for public applications.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onVerify={(v, action) => setActionTarget({ vendor: v, action })}
            />
          ))}
        </div>
      )}

      <AddVendorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <VendorVerifyDialog
        vendor={actionTarget?.vendor || null}
        action={actionTarget?.action || null}
        onClose={() => setActionTarget(null)}
      />
    </div>
  );
}
