import { FileText, ShieldCheck, CheckCircle2, AlertCircle, Ban, X, Pencil } from 'lucide-react';
import type { VendorProfile, VendorStatus } from '../api';
import { VendorStatusBadge } from './vendor-status-badge';
import { VIRUDHUNAGAR_MEAT_CATEGORIES } from '../constants';

interface VendorCardProps {
  vendor: VendorProfile;
  onOpenDossier: (vendor: VendorProfile) => void;
  onOpenPermissions: (vendor: VendorProfile) => void;
  onAction: (vendor: VendorProfile, action: VendorStatus) => void;
  onEdit?: (vendor: VendorProfile) => void;
}

export function VendorCard({
  vendor,
  onOpenDossier,
  onOpenPermissions,
  onAction,
  onEdit,
}: VendorCardProps) {
  const isPending = vendor.status === 'SUBMITTED' || vendor.status === 'UNDER_REVIEW';
  const isApproved = vendor.status === 'APPROVED';
  const isSuspended = vendor.status === 'SUSPENDED';

  const categories = vendor.allowedCategories || [];

  return (
    <div className="p-4 rounded-md border border-border bg-surface hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3 text-xs">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-text text-sm leading-tight flex items-center gap-1.5 flex-wrap">
              <span>{vendor.businessName}</span>
              {vendor.shop?.nameTa && (
                <span className="text-muted font-normal text-xs font-sans">({vendor.shop.nameTa})</span>
              )}
            </h3>
            <p className="text-muted text-[11px] mt-0.5">Owner: <span className="text-text font-medium">{vendor.ownerName}</span></p>
          </div>
          <VendorStatusBadge status={vendor.status} />
        </div>

        <div className="p-2.5 rounded-md bg-surface-muted border border-border space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span>FSSAI Lic:</span>
            <span className="font-mono text-text font-medium">{vendor.fssaiNumber}</span>
          </div>
          {vendor.shop && (
            <div className="flex items-center justify-between text-muted">
              <span>Town / Area:</span>
              <span className="font-medium text-text">{vendor.shop.city} ({vendor.shop.locality})</span>
            </div>
          )}
          {vendor.shop?.openingTime && (
            <div className="flex items-center justify-between text-muted">
              <span>Hours:</span>
              <span className="text-text">{vendor.shop.openingTime} – {vendor.shop.closingTime || '21:00'}</span>
            </div>
          )}
        </div>

        {/* Permitted Categories Badges */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Permitted Meats:</span>
            <button
              type="button"
              onClick={() => onOpenPermissions(vendor)}
              className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Configure</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.length > 0 ? (
              categories.map((slug) => {
                const meta = VIRUDHUNAGAR_MEAT_CATEGORIES.find((c) => c.slug === slug);
                return (
                  <span
                    key={slug}
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md border ${
                      meta?.badgeColor || 'bg-surface-muted text-muted border-border'
                    }`}
                  >
                    {meta?.name || slug}
                  </span>
                );
              })
            ) : (
              <span className="text-[11px] text-muted italic">No categories assigned</span>
            )}
          </div>
        </div>

        {vendor.rejectionReason && (
          <p className="text-rose-600 bg-rose-50/80 dark:bg-rose-950/20 p-1.5 rounded-md border border-rose-200 dark:border-rose-900/40 text-[11px]">
            <strong>Note:</strong> {vendor.rejectionReason}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          {/* Dossier Button - Sky Blue */}
          <button
            type="button"
            onClick={() => onOpenDossier(vendor)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
          >
            <FileText className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            <span>Dossier</span>
          </button>

          {/* Edit Button */}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(vendor)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-surface-muted text-text border border-border hover:bg-surface hover:border-primary/50"
              title="Edit stall details"
            >
              <Pencil className="h-3 w-3 text-muted" />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Quick Approve - Emerald Green */}
          {(!isApproved || isSuspended) && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'APPROVED')}
              title={isSuspended ? 'Re-activate stall' : 'Quick approve stall application'}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>{isSuspended ? 'Re-activate' : 'Approve'}</span>
            </button>
          )}

          {/* Request Changes - Amber Gold */}
          {isPending && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'RESUBMISSION_REQUIRED')}
              title="Request changes from vendor"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            >
              <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span>Changes</span>
            </button>
          )}

          {/* Suspend Stall - Rose Red */}
          {isApproved && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'SUSPENDED')}
              title="Suspend butcher stall"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            >
              <Ban className="h-3 w-3 text-rose-600 dark:text-rose-400" />
              <span>Suspend</span>
            </button>
          )}

          {/* Reject Application - Rose Red */}
          {isPending && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'REJECTED')}
              title="Reject stall application"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors text-muted hover:text-rose-600 hover:bg-rose-50 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
