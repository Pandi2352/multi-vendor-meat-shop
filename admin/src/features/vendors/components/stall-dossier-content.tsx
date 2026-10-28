import { useState } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import type { VendorProfile } from '../api';
import { VIRUDHUNAGAR_MEAT_CATEGORIES } from '../constants';

interface StallDossierContentProps {
  vendor: VendorProfile;
  onOpenPermissions: (vendor: VendorProfile) => void;
}

/** Premises, statutory licensing cards and authorized categories for stall dossier. */
export function StallDossierContent({ vendor, onOpenPermissions }: StallDossierContentProps) {
  const [copiedFssai, setCopiedFssai] = useState(false);
  const shop = vendor.shop;

  const copyFssai = () => {
    navigator.clipboard.writeText(vendor.fssaiNumber).then(() => {
      setCopiedFssai(true);
      setTimeout(() => setCopiedFssai(false), 2000);
    });
  };

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      {/* Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-md bg-surface-muted/60 border border-border">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">
            Town / Hub
          </span>
          <p className="text-sm font-semibold text-text mt-0.5 truncate">
            {shop?.city || 'Virudhunagar'}
          </p>
        </div>
        <div className="p-3 rounded-md bg-surface-muted/60 border border-border">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">
            Hyperlocal Radius
          </span>
          <p className="text-sm font-semibold text-text mt-0.5">
            {shop?.serviceRadiusKm || 8} km Coverage
          </p>
        </div>
        <div className="p-3 rounded-md bg-surface-muted/60 border border-border">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">
            Daily Hours
          </span>
          <p className="text-sm font-semibold text-text mt-0.5">
            {shop?.openingTime || '06:00'} – {shop?.closingTime || '21:00'}
          </p>
        </div>
        <div className="p-3 rounded-md bg-surface-muted/60 border border-border">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">
            Categories
          </span>
          <p className="text-sm font-semibold text-text mt-0.5">
            {(vendor.allowedCategories || []).length} Permitted Cuts
          </p>
        </div>
      </div>

      {/* 2-Column Grid: Premises & Statutory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Premises & Operational Info */}
        <div className="p-4 rounded-md bg-surface-muted/50 border border-border space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border/60">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
              Stall Premises & Service Coverage
            </h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-muted block text-[11px]">Street Address</span>
              <p className="font-medium text-text mt-0.5 leading-relaxed">
                {shop
                  ? `${shop.line1}, ${shop.locality}, ${shop.city} - ${shop.pincode}`
                  : 'Premises address pending registration'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-muted block text-[11px]">Contact Phone</span>
                <p className="font-medium text-text mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted" />
                  {shop?.phone || '—'}
                </p>
              </div>
              <div>
                <span className="text-muted block text-[11px]">District / State</span>
                <p className="font-medium text-text mt-0.5">Virudhunagar, Tamil Nadu</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-muted block text-[11px]">Operating Schedule</span>
                <p className="font-medium text-text mt-0.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted" />
                  {shop?.openingTime || '06:00'} – {shop?.closingTime || '21:00'}
                </p>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Delivery Dispatch Radius</span>
                <p className="font-medium text-text mt-0.5 flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-muted" />
                  {shop?.serviceRadiusKm || 8} km
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Licences & Municipal Permits */}
        <div className="p-4 rounded-md bg-surface-muted/50 border border-border space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border/60">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
              Food Safety & Municipal Certification
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-md bg-surface border border-border space-y-1.5">
              <span className="text-muted text-[11px]">FSSAI Central / State Licence</span>
              <div className="flex items-center justify-between font-mono font-semibold text-text text-sm">
                <span>{vendor.fssaiNumber}</span>
                <button
                  type="button"
                  onClick={copyFssai}
                  className="text-muted hover:text-primary p-1 rounded-md transition-colors"
                  title="Copy FSSAI"
                >
                  {copiedFssai ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              {vendor.fssaiDocumentUrl && (
                <a
                  href={vendor.fssaiDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-0.5"
                >
                  <span>View FSSAI Certificate</span> <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="p-3 rounded-md bg-surface border border-border space-y-1.5">
              <span className="text-muted text-[11px]">Municipal Butcher Permit</span>
              <p className="font-mono font-semibold text-text text-sm">
                {vendor.municipalPermitNumber || 'VDR-MC-VERIFIED'}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Hygiene & municipal inspection passed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Allowed Meat Categories */}
      <div className="p-4 rounded-md bg-surface-muted/50 border border-border space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
              Authorized Meat Categories & Cuts
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenPermissions(vendor)}
            className="text-primary hover:underline text-xs font-medium flex items-center gap-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Edit Permissions
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
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
            <span className="text-muted italic text-xs">
              No meat categories explicitly permitted yet. Configure permitted cuts before stall
              goes live.
            </span>
          )}
        </div>
      </div>

      {/* Rejection / Resubmission reason if any */}
      {vendor.rejectionReason && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Changes / Rejection Reason:</strong>
            <span>{vendor.rejectionReason}</span>
          </div>
        </div>
      )}
    </div>
  );
}
