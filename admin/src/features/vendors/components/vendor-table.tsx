import { FileText, Pencil, CheckCircle2, Ban, AlertCircle, Phone, Clock, MapPin } from 'lucide-react';
import type { VendorProfile, VendorStatus } from '../api';
import { VendorStatusBadge } from './vendor-status-badge';

interface VendorTableProps {
  vendors: VendorProfile[];
  onOpenDossier: (vendor: VendorProfile) => void;
  onAction: (vendor: VendorProfile, action: VendorStatus) => void;
  onEdit?: (vendor: VendorProfile) => void;
}

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Tabular executive view of Sivakasi butcher stalls. */
export function VendorTable({
  vendors,
  onOpenDossier,
  onAction,
  onEdit,
}: VendorTableProps) {
  return (
    <div className="border border-border rounded-md overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-muted/80 border-b border-border text-muted uppercase font-semibold tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Stall / கடை விவரம்</th>
              <th className="py-3 px-4">Owner & Contact</th>
              <th className="py-3 px-4">Town & Coverage</th>
              <th className="py-3 px-4">FSSAI Licence</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendors.map((vendor) => {
              const shop = vendor.shop;
              const isApproved = vendor.status === 'APPROVED';
              const isPending = vendor.status === 'SUBMITTED' || vendor.status === 'UNDER_REVIEW';
              const isSuspended = vendor.status === 'SUSPENDED';

              return (
                <tr key={vendor.id} className="hover:bg-surface-muted/30 transition-colors">
                  {/* Stall Identity */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5 min-w-[200px]">
                      <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                        {getMonogram(vendor.businessName)}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onOpenDossier(vendor)}
                          className="font-semibold text-text text-xs hover:text-primary transition-colors text-left truncate block max-w-[220px]"
                          title={vendor.businessName}
                        >
                          {vendor.businessName}
                        </button>
                        {shop?.nameTa && (
                          <p className="text-muted text-[11px] truncate max-w-[220px]" title={shop.nameTa}>
                            {shop.nameTa}
                          </p>
                        )}
                        <span className="text-[10px] text-muted truncate block">
                          {shop?.locality || 'Town Centre'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Owner & Phone */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-medium text-text">{vendor.ownerName}</p>
                    <p className="text-muted text-[11px] flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-muted" />
                      {shop?.phone || '—'}
                    </p>
                  </td>

                  {/* Town & Coverage */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-text">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span>{shop?.city || 'Sivakasi'}</span>
                      <span className="text-muted text-[11px]">({shop?.serviceRadiusKm || 8} km)</span>
                    </div>
                    <p className="text-muted text-[11px] flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-muted" />
                      {shop?.openingTime || '06:00'} – {shop?.closingTime || '21:00'}
                    </p>
                  </td>

                  {/* FSSAI */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-mono text-text font-medium text-[11px]">{vendor.fssaiNumber}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <VendorStatusBadge status={vendor.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenDossier(vendor)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-border bg-surface text-text hover:bg-surface-muted transition-colors"
                        title="View Full Stall Dossier"
                      >
                        <FileText className="h-3 w-3 text-muted" />
                        <span>Dossier</span>
                      </button>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(vendor)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-border bg-surface text-text hover:bg-surface-muted transition-colors"
                          title="Edit Stall Details"
                        >
                          <Pencil className="h-3 w-3 text-muted" />
                          <span>Edit</span>
                        </button>
                      )}

                      {(!isApproved || isSuspended) && (
                        <button
                          type="button"
                          onClick={() => onAction(vendor, 'APPROVED')}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{isSuspended ? 'Reactivate' : 'Approve'}</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onAction(vendor, 'RESUBMISSION_REQUIRED')}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-border text-text hover:bg-surface-muted transition-colors"
                        >
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          <span>Changes</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => onAction(vendor, 'SUSPENDED')}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Ban className="h-3 w-3" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
