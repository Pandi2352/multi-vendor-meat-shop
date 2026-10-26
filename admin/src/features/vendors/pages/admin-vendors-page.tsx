import { useState } from 'react';
import { Plus, Store } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAdminVendors, type VendorProfile } from '../api';
import { VendorCard } from '../components/vendor-card';
import { VendorVerifyDialog } from '../components/vendor-verify-dialog';
import { AddVendorModal } from '../components/add-vendor-modal';

export function AdminVendorsPage() {
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
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

  return (
    <div className="space-y-4 p-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Butcher Stalls & Vendors (விருதுநகர்)
          </h1>
          <p className="text-xs text-muted">
            Manage Virudhunagar district butcher stalls and review public onboarding applications.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsAddOpen(true)}>
          Add Butcher Stall
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setTab('ALL')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            tab === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text hover:bg-surface-muted'
          }`}
        >
          All ({allVendors.length})
        </button>
        <button
          onClick={() => setTab('PENDING')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            tab === 'PENDING' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text hover:bg-surface-muted'
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setTab('APPROVED')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            tab === 'APPROVED' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text hover:bg-surface-muted'
          }`}
        >
          Active Stalls ({approvedCount})
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted">Loading vendor applications...</div>
      ) : filteredVendors.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2">
          <Store className="h-8 w-8 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No stalls found</p>
          <p className="text-xs text-muted">
            {tab === 'PENDING'
              ? 'No pending verification requests at this time.'
              : 'Add your first butcher stall or wait for public applications.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
