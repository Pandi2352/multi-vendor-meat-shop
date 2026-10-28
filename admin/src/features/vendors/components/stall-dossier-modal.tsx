import { X, Store, CheckCircle2, AlertCircle, Ban, Pencil } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateIST } from '@/utils/format';
import type { VendorProfile, VendorStatus } from '../api';
import { VendorStatusBadge } from './vendor-status-badge';
import { StallDossierContent } from './stall-dossier-content';

interface StallDossierModalProps {
  vendor: VendorProfile | null;
  onClose: () => void;
  onAction: (vendor: VendorProfile, action: VendorStatus) => void;
  onOpenPermissions: (vendor: VendorProfile) => void;
  onEdit?: (vendor: VendorProfile) => void;
}

/** Stall dossier dialog presenting operational metrics, compliance certificates and approvals. */
export function StallDossierModal({
  vendor,
  onClose,
  onAction,
  onOpenPermissions,
  onEdit,
}: StallDossierModalProps) {
  if (!vendor) return null;

  const isApproved = vendor.status === 'APPROVED';
  const isSuspended = vendor.status === 'SUSPENDED';
  const shop = vendor.shop;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-surface">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-text">{vendor.businessName}</h2>
                {shop?.nameTa && (
                  <span className="text-sm text-muted font-sans font-medium">({shop.nameTa})</span>
                )}
                <VendorStatusBadge status={vendor.status} />
              </div>
              <p className="text-xs text-muted mt-0.5">
                Owner: <span className="text-text font-medium">{vendor.ownerName}</span> • Registered{' '}
                {formatDateIST(vendor.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <StallDossierContent vendor={vendor} onOpenPermissions={onOpenPermissions} />

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-border bg-surface-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Dossier
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => {
                  onClose();
                  onEdit(vendor);
                }}
              >
                Edit Stall
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isApproved && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => {
                  onClose();
                  onAction(vendor, 'APPROVED');
                }}
              >
                Approve Stall
              </Button>
            )}
            {vendor.status !== 'RESUBMISSION_REQUIRED' && !isApproved && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertCircle className="h-4 w-4 text-amber-600" />}
                onClick={() => {
                  onClose();
                  onAction(vendor, 'RESUBMISSION_REQUIRED');
                }}
              >
                Request Changes
              </Button>
            )}
            {isApproved && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Ban className="h-4 w-4" />}
                onClick={() => {
                  onClose();
                  onAction(vendor, 'SUSPENDED');
                }}
              >
                Suspend Stall
              </Button>
            )}
            {isSuspended && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => {
                  onClose();
                  onAction(vendor, 'APPROVED');
                }}
              >
                Re-activate Stall
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
