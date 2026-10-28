import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store, CheckCircle, Clock, Ban } from 'lucide-react';
import { Button, LoaderState, Pagination, type TabItem, type SelectOption } from '@/components/ui';
import { ROUTES, buildPath } from '@/config/routes';
import { useAdminVendors, type VendorProfile, type VendorStatus } from '../api';
import { VendorCard } from '../components/vendor-card';
import { VendorTable } from '../components/vendor-table';
import { VendorKpiStrip } from '../components/vendor-kpi-strip';
import { VendorToolbar, type VendorTab, type ViewMode } from '../components/vendor-toolbar';
import { VendorVerifyDialog } from '../components/vendor-verify-dialog';
import { StallDossierModal } from '../components/stall-dossier-modal';

/** Executive management page for certified butcher stalls. */
export function AdminVendorsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<VendorTab>('ALL');
  const [selectedTown, setSelectedTown] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [dossierTarget, setDossierTarget] = useState<VendorProfile | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<{
    vendor: VendorProfile;
    action: VendorStatus;
  } | null>(null);

  const { data, isLoading } = useAdminVendors({ limit: 100 });
  const allVendors = data?.items || [];

  const distinctTowns = useMemo(() => {
    const towns = new Set<string>();
    allVendors.forEach((v) => {
      const c = v.shop?.city?.trim();
      if (c) towns.add(c);
    });
    return Array.from(towns);
  }, [allVendors]);

  const townOptions: SelectOption[] = useMemo(() => [
    { value: 'ALL', label: `All Towns (${allVendors.length})` },
    ...distinctTowns.map((town) => ({
      value: town,
      label: `${town} (${allVendors.filter((v) => v.shop?.city?.trim().toLowerCase() === town.toLowerCase()).length})`,
    })),
  ], [allVendors, distinctTowns]);

  const filteredVendors = useMemo(() => {
    return allVendors.filter((v) => {
      if (tab === 'PENDING' && !['SUBMITTED', 'UNDER_REVIEW', 'RESUBMISSION_REQUIRED'].includes(v.status)) {
        return false;
      }
      if (tab === 'APPROVED' && v.status !== 'APPROVED') return false;
      if (tab === 'SUSPENDED' && v.status !== 'SUSPENDED') return false;
      if (
        selectedTown &&
        selectedTown !== 'ALL' &&
        v.shop?.city?.trim().toLowerCase() !== selectedTown.trim().toLowerCase()
      ) {
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

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const paginatedVendors = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, page, pageSize]);

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
            Butcher Stalls
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage certified butcher stalls, FSSAI compliance, operational hours, and doorstep delivery coverage.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => navigate(ROUTES.ADMIN_VENDORS_NEW)}
        >
          Add Butcher Stall
        </Button>
      </div>

      {/* Compact Modern KPI Cards */}
      <VendorKpiStrip
        totalCount={allVendors.length}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
        hubCount={distinctTowns.length}
      />

      {/* Filter Toolbar */}
      <VendorToolbar
        tab={tab}
        tabItems={tabItems}
        onTabChange={(t) => {
          setTab(t);
          setPage(1);
        }}
        selectedTown={selectedTown}
        townOptions={townOptions}
        onTownChange={(val) => {
          setSelectedTown(val);
          setPage(1);
        }}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Stalls Display: Grid or Table View */}
      {isLoading ? (
        <LoaderState
          title="Loading butcher stalls..."
          description="Fetching verified butcher stalls..."
        />
      ) : filteredVendors.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-md space-y-2 bg-surface">
          <Store className="h-8 w-8 text-muted mx-auto" />
          <p className="text-sm font-medium text-text">No stalls match this filter</p>
          <p className="text-xs text-muted">Try clearing the search query or town filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onOpenDossier={(v) => setDossierTarget(v)}
              onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
              onEdit={(v) => navigate(buildPath(ROUTES.ADMIN_VENDORS_EDIT, { id: v.id }))}
            />
          ))}
        </div>
      ) : (
        <VendorTable
          vendors={paginatedVendors}
          onOpenDossier={(v) => setDossierTarget(v)}
          onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
          onEdit={(v) => navigate(buildPath(ROUTES.ADMIN_VENDORS_EDIT, { id: v.id }))}
        />
      )}

      {/* Common Pagination */}
      {filteredVendors.length > 0 && (
        <div className="pt-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredVendors.length}
            pageSize={pageSize}
            pageSizeOptions={[6, 9, 12, 18, 24]}
            onPageChange={setPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
            size="sm"
          />
        </div>
      )}

      {/* Dossier & Verification Dialogs */}
      <StallDossierModal
        vendor={dossierTarget}
        onClose={() => setDossierTarget(null)}
        onAction={(v, action) => setVerifyTarget({ vendor: v, action })}
        onEdit={(v) => navigate(buildPath(ROUTES.ADMIN_VENDORS_EDIT, { id: v.id }))}
      />
      <VendorVerifyDialog
        vendor={verifyTarget?.vendor || null}
        action={verifyTarget?.action || null}
        onClose={() => setVerifyTarget(null)}
      />
    </div>
  );
}
