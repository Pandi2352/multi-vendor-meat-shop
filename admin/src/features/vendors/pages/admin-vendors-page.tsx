import { useState, useMemo } from 'react';
import { Plus, Store, CheckCircle, Clock, Ban } from 'lucide-react';
import { Button, LoaderState, Tabs, SearchInput, type TabItem } from '@/components/ui';
import { useAdminVendors, type VendorProfile, type VendorStatus } from '../api';
import { VendorCard } from '../components/vendor-card';
import { VendorKpiStrip } from '../components/vendor-kpi-strip';
import { VendorVerifyDialog } from '../components/vendor-verify-dialog';
import { AddVendorModal } from '../components/add-vendor-modal';
import { EditVendorModal } from '../components/edit-vendor-modal';
import { StallDossierModal } from '../components/stall-dossier-modal';

type VendorTab = 'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED';

/** Executive management page for butcher stalls across Sivakasi & Virudhunagar district. */
export function AdminVendorsPage() {
  const [tab, setTab] = useState<VendorTab>('ALL');
  const [selectedTown, setSelectedTown] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [dossierTarget, setDossierTarget] = useState<VendorProfile | null>(null);
  const [editTarget, setEditTarget] = useState<VendorProfile | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<{
    vendor: VendorProfile;
    action: VendorStatus;
  } | null>(null);

  const { data, isLoading } = useAdminVendors();
  const allVendors = data?.items || [];

  const distinctTowns = useMemo(() => {
    const towns = new Set<string>();
    allVendors.forEach((v) => {
      if (v.shop?.city) towns.add(v.shop.city);
    });
    return Array.from(towns);
  }, [allVendors]);

  const filteredVendors = useMemo(() => {
    return allVendors.filter((v) => {
      if (tab === 'PENDING') {
        const isP =
          v.status === 'SUBMITTED' ||
          v.status === 'UNDER_REVIEW' ||
          v.status === 'RESUBMISSION_REQUIRED';
        if (!isP) return false;
      } else if (tab === 'APPROVED' && v.status !== 'APPROVED') {
        return false;
      } else if (tab === 'SUSPENDED' && v.status !== 'SUSPENDED') {
        return false;
      }

      if (selectedTown !== 'ALL' && v.shop?.city !== selectedTown) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          v.businessName.toLowerCase().includes(q) ||
          (v.shop?.nameTa && v.shop.nameTa.toLowerCase().includes(q)) ||
          v.ownerName.toLowerCase().includes(q) ||
          v.fssaiNumber.toLowerCase().includes(q) ||
          (v.shop?.city && v.shop.city.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allVendors, tab, selectedTown, search]);

  const pendingCount = allVendors.filter(
    (v) =>
      v.status === 'SUBMITTED' ||
      v.status === 'UNDER_REVIEW' ||
      v.status === 'RESUBMISSION_REQUIRED',
  ).length;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Butcher Stalls & Verification (சிவகாசி & சுற்றியுள்ள பகுதிகள்)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage certified butcher stalls, FSSAI compliance, operational hours, and doorstep delivery coverage.
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

      {/* Awesome KPI Count Cards with Icons */}
      <VendorKpiStrip
        totalCount={allVendors.length}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
        hubCount={distinctTowns.length}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <Tabs<VendorTab> tabs={tabItems} activeTab={tab} onChange={setTab} />
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search stall, owner, town, or FSSAI..."
          />
        </div>
      </div>

      {/* Quick Town Filter Pills */}
      {distinctTowns.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-muted font-medium shrink-0 mr-1">Filter Town:</span>
          <button
            type="button"
            onClick={() => setSelectedTown('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors shrink-0 ${
              selectedTown === 'ALL'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface text-muted border-border hover:text-text hover:bg-surface-muted'
            }`}
          >
            All Towns ({allVendors.length})
          </button>
          {distinctTowns.map((town) => {
            const count = allVendors.filter((v) => v.shop?.city === town).length;
            const isSel = selectedTown === town;
            return (
              <button
                key={town}
                type="button"
                onClick={() => setSelectedTown(town)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors shrink-0 ${
                  isSel
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface text-muted border-border hover:text-text hover:bg-surface-muted'
                }`}
              >
                {town} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Stalls */}
      {isLoading ? (
        <LoaderState
          title="Loading butcher stalls..."
          description="Fetching verified Sivakasi and surrounding butcher stalls..."
        />
      ) : filteredVendors.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2 bg-surface">
          <Store className="h-8 w-8 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No stalls match this filter</p>
          <p className="text-xs text-muted">Try clearing the search query or town filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onOpenDossier={(v) => setDossierTarget(v)}
              onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
              onEdit={(v) => setEditTarget(v)}
            />
          ))}
        </div>
      )}

      {/* Modals & Dialogs */}
      <AddVendorModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditVendorModal vendor={editTarget} onClose={() => setEditTarget(null)} />
      <StallDossierModal
        vendor={dossierTarget}
        onClose={() => setDossierTarget(null)}
        onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
        onEdit={(v) => setEditTarget(v)}
      />
      <VendorVerifyDialog
        vendor={verifyTarget?.vendor || null}
        action={verifyTarget?.action || null}
        onClose={() => setVerifyTarget(null)}
      />
    </div>
  );
}
