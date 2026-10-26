import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { VendorProfile } from '../api';
import { VendorStatusBadge } from './vendor-status-badge';

interface VendorCardProps {
  vendor: VendorProfile;
  onVerify: (vendor: VendorProfile, action: 'APPROVED' | 'REJECTED') => void;
}

export function VendorCard({ vendor, onVerify }: VendorCardProps) {
  const isPending = vendor.status === 'SUBMITTED' || vendor.status === 'UNDER_REVIEW';

  return (
    <div className="p-4 rounded-md border border-border bg-surface hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3 text-xs">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-text text-sm leading-tight">{vendor.businessName}</h3>
            <p className="text-muted">Owner: {vendor.ownerName}</p>
          </div>
          <VendorStatusBadge status={vendor.status} />
        </div>

        <div className="p-2.5 rounded-md bg-surface-muted border border-border space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span>FSSAI Lic:</span>
            <span className="font-mono text-text">{vendor.fssaiNumber}</span>
          </div>
          {vendor.shop && (
            <div className="flex items-center justify-between text-muted">
              <span>Town:</span>
              <span className="font-medium text-text">
                {vendor.shop.city} ({vendor.shop.locality})
              </span>
            </div>
          )}
          {vendor.shop?.phone && (
            <div className="flex items-center justify-between text-muted">
              <span>Phone:</span>
              <span className="text-text">{vendor.shop.phone}</span>
            </div>
          )}
        </div>

        {vendor.rejectionReason && (
          <p className="text-danger bg-danger-soft p-1.5 rounded-md border border-danger/20">
            Reason: {vendor.rejectionReason}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted">
          Added: {new Date(vendor.createdAt).toLocaleDateString('en-IN')}
        </span>

        {isPending && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="danger"
              size="sm"
              leftIcon={<X className="h-3.5 w-3.5" />}
              onClick={() => onVerify(vendor, 'REJECTED')}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check className="h-3.5 w-3.5" />}
              onClick={() => onVerify(vendor, 'APPROVED')}
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
