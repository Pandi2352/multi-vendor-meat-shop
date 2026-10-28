import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Ban,
  Pencil,
  MapPin,
  Clock,
  Navigation,
} from 'lucide-react';
import type { VendorProfile, VendorStatus } from '../api';
import { VendorStatusBadge } from './vendor-status-badge';

interface VendorCardProps {
  vendor: VendorProfile;
  onOpenDossier: (vendor: VendorProfile) => void;
  onAction: (vendor: VendorProfile, action: VendorStatus) => void;
  onEdit?: (vendor: VendorProfile) => void;
}

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Modern stall card displaying identity, bilingual name, coverage and operations. */
export function VendorCard({
  vendor,
  onOpenDossier,
  onAction,
  onEdit,
}: VendorCardProps) {
  const isPending = vendor.status === 'SUBMITTED' || vendor.status === 'UNDER_REVIEW';
  const isApproved = vendor.status === 'APPROVED';
  const isSuspended = vendor.status === 'SUSPENDED';
  const shop = vendor.shop;

  return (
    <div className="p-4 rounded-md border border-border bg-surface hover:border-primary/50 transition-all flex flex-col justify-between space-y-3.5 text-xs">
      {/* Header with Monogram, Title, and Status */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs tracking-wider">
              {getMonogram(vendor.businessName)}
            </div>
            <div className="min-w-0">
              <h3
                onClick={() => onOpenDossier(vendor)}
                className="font-semibold text-text text-sm leading-tight hover:text-primary transition-colors cursor-pointer truncate"
                title={vendor.businessName}
              >
                {vendor.businessName}
              </h3>
              {shop?.nameTa && (
                <p className="text-muted font-sans text-[11px] truncate mt-0.5" title={shop.nameTa}>
                  {shop.nameTa}
                </p>
              )}
              <p className="text-muted text-[11px] mt-0.5 truncate">
                Owner: <span className="text-text font-medium">{vendor.ownerName}</span>
              </p>
            </div>
          </div>
          <VendorStatusBadge status={vendor.status} />
        </div>

        {/* Operational Highlights Card */}
        <div className="p-3 rounded-md bg-surface-muted/50 border border-border space-y-2">
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-text min-w-0">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold shrink-0">{shop?.city || 'Virudhunagar'}</span>
            <span className="text-muted truncate">• {shop?.locality || 'Town Centre'}</span>
          </div>

          {/* Hours & Dispatch Radius */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
            <span className="flex items-center gap-1 truncate">
              <Clock className="h-3 w-3 text-muted shrink-0" />
              <span className="text-text font-medium truncate">
                {shop?.openingTime || '06:00'} – {shop?.closingTime || '21:00'}
              </span>
            </span>
            <span className="flex items-center gap-1 truncate">
              <Navigation className="h-3 w-3 text-muted shrink-0" />
              <span className="text-text font-medium truncate">
                {shop?.serviceRadiusKm || 8} km radius
              </span>
            </span>
          </div>

          {/* FSSAI Statutory Strip */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="text-muted font-mono truncate">
              LIC: <span className="text-text font-medium">{vendor.fssaiNumber}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium shrink-0">
              <CheckCircle2 className="h-3 w-3" /> FSSAI Verified
            </span>
          </div>
        </div>


        {vendor.rejectionReason && (
          <p className="text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20 text-[11px]">
            <strong>Note:</strong> {vendor.rejectionReason}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDossier(vendor)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-surface text-text hover:bg-surface-muted transition-colors"
          >
            <FileText className="h-3 w-3 text-muted" />
            <span>Dossier</span>
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(vendor)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-surface text-text hover:bg-surface-muted transition-colors"
              title="Edit stall details"
            >
              <Pencil className="h-3 w-3 text-muted" />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {(!isApproved || isSuspended) && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'APPROVED')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>{isSuspended ? 'Reactivate' : 'Approve'}</span>
            </button>
          )}

          {isPending && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'RESUBMISSION_REQUIRED')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border text-text hover:bg-surface-muted transition-colors"
            >
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>Changes</span>
            </button>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={() => onAction(vendor, 'SUSPENDED')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Ban className="h-3 w-3" />
              <span>Suspend</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
