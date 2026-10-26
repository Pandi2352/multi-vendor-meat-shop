import { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useVerifyVendor, type VendorProfile } from '../api';

interface VendorVerifyDialogProps {
  vendor: VendorProfile | null;
  action: 'APPROVED' | 'REJECTED' | null;
  onClose: () => void;
}

export function VendorVerifyDialog({ vendor, action, onClose }: VendorVerifyDialogProps) {
  const [reason, setReason] = useState('');
  const verifyMutation = useVerifyVendor();

  if (!vendor || !action) return null;

  const isApprove = action === 'APPROVED';

  const handleConfirm = () => {
    verifyMutation.mutate(
      {
        id: vendor.id,
        data: {
          status: action,
          rejectionReason: isApprove ? undefined : reason.trim() || 'FSSAI details could not be verified',
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-danger" />
            )}
            <h3 className="text-base font-semibold text-text">
              {isApprove ? 'Approve Stall Application' : 'Reject Stall Application'}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-md bg-surface-muted border border-border space-y-1">
            <p className="font-semibold text-text">{vendor.businessName}</p>
            <p className="text-muted">Owner: {vendor.ownerName}</p>
            <p className="text-muted">FSSAI: <span className="font-mono text-text">{vendor.fssaiNumber}</span></p>
            {vendor.shop && (
              <p className="text-muted">Location: {vendor.shop.locality}, {vendor.shop.city} ({vendor.shop.pincode})</p>
            )}
          </div>

          {isApprove ? (
            <p className="text-muted">
              Approving this vendor will set their status to <strong>APPROVED</strong>, promote their account to <strong>Vendor Owner</strong>, and open their stall for live orders on the marketplace.
            </p>
          ) : (
            <div className="space-y-1.5 pt-1">
              <label className="block font-medium text-text">Reason for rejection *</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. FSSAI registration number invalid or expired"
                className="w-full h-20 p-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'primary' : 'danger'}
            size="sm"
            loading={verifyMutation.isPending}
            onClick={handleConfirm}
          >
            {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </div>
  );
}
