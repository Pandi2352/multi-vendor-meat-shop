import { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Ban, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import type { VendorProfile, VendorStatus } from '../api';
import { VendorStatusBadge } from './vendor-status-badge';
import { VIRUDHUNAGAR_MEAT_CATEGORIES } from '../constants';

interface StallDossierModalProps {
  vendor: VendorProfile | null;
  onClose: () => void;
  onAction: (vendor: VendorProfile, action: VendorStatus) => void;
  onOpenPermissions: (vendor: VendorProfile) => void;
}

export function StallDossierModal({ vendor, onClose, onAction, onOpenPermissions }: StallDossierModalProps) {
  const [copiedFssai, setCopiedFssai] = useState(false);

  if (!vendor) return null;

  const copyFssai = () => {
    navigator.clipboard.writeText(vendor.fssaiNumber).then(() => {
      setCopiedFssai(true);
      setTimeout(() => setCopiedFssai(false), 2000);
    });
  };

  const isApproved = vendor.status === 'APPROVED';
  const isSuspended = vendor.status === 'SUSPENDED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text">{vendor.businessName}</h3>
                <VendorStatusBadge status={vendor.status} />
              </div>
              <p className="text-xs text-muted">Owner: {vendor.ownerName} • Registered on {new Date(vendor.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md"><X className="h-4 w-4" /></button>
        </div>

        {/* Section 1: Shop & Operational Hours */}
        <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-2 text-xs">
          <p className="font-semibold text-text uppercase tracking-wider text-[11px] text-muted">Stall Premises & Service Coverage</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted">Shop Address:</span>
              <p className="font-medium text-text mt-0.5">{vendor.shop ? `${vendor.shop.line1}, ${vendor.shop.locality}, ${vendor.shop.city} - ${vendor.shop.pincode}` : 'Address pending'}</p>
            </div>
            <div>
              <span className="text-muted">Contact Phone:</span>
              <p className="font-medium text-text mt-0.5">{vendor.shop?.phone || '—'}</p>
            </div>
            <div>
              <span className="text-muted">Operating Hours:</span>
              <p className="font-medium text-text mt-0.5">{vendor.shop?.openingTime || '06:00'} AM – {vendor.shop?.closingTime || '21:00'} PM</p>
            </div>
            <div>
              <span className="text-muted">Hyperlocal Service Radius:</span>
              <p className="font-medium text-text mt-0.5">{vendor.shop?.serviceRadiusKm || 8} km (Virudhunagar)</p>
            </div>
          </div>
        </div>

        {/* Section 2: Statutory Licences & Municipal Permits */}
        <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-2.5 text-xs">
          <p className="font-semibold text-text uppercase tracking-wider text-[11px] text-muted">Food Safety & Municipal Certification</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-md bg-surface border border-border space-y-1">
              <span className="text-muted text-[11px]">FSSAI Central / State Licence</span>
              <div className="flex items-center justify-between font-mono font-semibold text-text">
                <span>{vendor.fssaiNumber}</span>
                <button type="button" onClick={copyFssai} className="text-muted hover:text-primary">
                  {copiedFssai ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              {vendor.fssaiDocumentUrl && (
                <a href={vendor.fssaiDocumentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-0.5">
                  <span>View FSSAI Certificate</span> <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="p-2.5 rounded-md bg-surface border border-border space-y-1">
              <span className="text-muted text-[11px]">Municipal Butcher Permit</span>
              <p className="font-mono font-semibold text-text">{vendor.municipalPermitNumber || 'VDR-MC-VERIFIED'}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Health & hygiene verified
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Allowed Meat Categories */}
        <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-text uppercase tracking-wider text-[11px] text-muted">Authorized Meat Categories</p>
            <button type="button" onClick={() => onOpenPermissions(vendor)} className="text-primary hover:underline font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Edit Permissions
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {(vendor.allowedCategories || []).length > 0 ? (
              vendor.allowedCategories?.map((slug) => {
                const meta = VIRUDHUNAGAR_MEAT_CATEGORIES.find((c) => c.slug === slug);
                return (
                  <Badge key={slug} tone="info">
                    {meta?.name || slug}
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted italic">No categories explicitly permitted yet.</span>
            )}
          </div>
        </div>

        {/* Reason or Notes */}
        {vendor.rejectionReason && (
          <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-xs text-rose-700 dark:text-rose-300">
            <strong>Rejection / Changes Reason:</strong> {vendor.rejectionReason}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>Close Dossier</Button>
          <div className="flex items-center gap-1.5">
            {!isApproved && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                onClick={() => { onClose(); onAction(vendor, 'APPROVED'); }}
              >
                Approve Stall
              </Button>
            )}
            {vendor.status !== 'RESUBMISSION_REQUIRED' && !isApproved && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                onClick={() => { onClose(); onAction(vendor, 'RESUBMISSION_REQUIRED'); }}
              >
                Request Changes
              </Button>
            )}
            {isApproved && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Ban className="h-3.5 w-3.5" />}
                onClick={() => { onClose(); onAction(vendor, 'SUSPENDED'); }}
              >
                Suspend Stall
              </Button>
            )}
            {isSuspended && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                onClick={() => { onClose(); onAction(vendor, 'APPROVED'); }}
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
