import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Ban, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useVerifyVendor, type VendorProfile, type VendorStatus } from '../api';
import { VendorInvitedPanel } from './vendor-invited-panel';

interface VendorVerifyDialogProps {
  vendor: VendorProfile | null;
  action: VendorStatus | null;
  onClose: () => void;
}

export function VendorVerifyDialog({ vendor, action, onClose }: VendorVerifyDialogProps) {
  const [reason, setReason] = useState('');
  const [approved, setApproved] = useState<VendorProfile | null>(null);

  const close = () => {
    setApproved(null);
    onClose();
  };
  const verifyMutation = useVerifyVendor();

  if (!vendor || !action) return null;

  const isApprove = action === 'APPROVED';
  const isChanges = action === 'RESUBMISSION_REQUIRED';
  const isSuspend = action === 'SUSPENDED';
  const isReject = action === 'REJECTED';

  const title = isApprove
    ? vendor.status === 'SUSPENDED'
      ? 'Re-activate Butcher Stall'
      : 'Approve Butcher Stall'
    : isChanges
      ? 'Request Application Changes'
      : isSuspend
        ? 'Suspend Butcher Stall'
        : 'Reject Stall Application';

  const handleConfirm = () => {
    verifyMutation.mutate(
      {
        id: vendor.id,
        data: {
          status: action,
          rejectionReason: !isApprove ? reason.trim() || undefined : undefined,
          notes: !isApprove ? reason.trim() : 'Hygiene & licensing verified by administrator',
        },
      },
      {
        // Approval invites the owner: show what happened before closing.
        onSuccess: (updated) => (updated.invitation ? setApproved(updated) : close()),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : isChanges ? (
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            ) : isSuspend ? (
              <Ban className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            )}
            <h3 className="text-base font-semibold text-text">{title}</h3>
          </div>
          <button onClick={close} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        {approved?.invitation ? (
          <VendorInvitedPanel
            message={
              <>
                <strong className="text-text">{vendor.businessName}</strong> is approved. The owner
                was invited to set a password and open their shop portal.
              </>
            }
            invitation={approved.invitation}
            onDone={close}
          />
        ) : (
          <>
            <div className="p-3 rounded-md bg-surface-muted border border-border space-y-1 text-xs">
              <p className="font-semibold text-text">{vendor.businessName}</p>
              <p className="text-muted">
                Owner: {vendor.ownerName} • FSSAI:{' '}
                <span className="font-mono text-text">{vendor.fssaiNumber}</span>
              </p>
              {vendor.shop && (
                <p className="text-muted">
                  Location: {vendor.shop.locality}, {vendor.shop.city}
                </p>
              )}
            </div>

            <div className="text-xs space-y-2">
              {isApprove && (
                <p className="text-muted leading-relaxed">
                  This will set the verification status to <strong>APPROVED</strong>, open the stall
                  for customer orders, and email the owner an invitation to set their password (if
                  they don’t have one yet).
                </p>
              )}

              {isChanges && (
                <div className="space-y-1.5">
                  <label className="block font-medium text-text">
                    Notes for Vendor Resubmission *
                  </label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Please upload clear photo of municipal trade licence or updated FSSAI certificate"
                    className="w-full h-20 p-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary resize-none text-xs"
                  />
                </div>
              )}

              {(isSuspend || isReject) && (
                <div className="space-y-1.5">
                  <label className="block font-medium text-text">
                    {isSuspend ? 'Reason for Stall Suspension *' : 'Reason for Rejection *'}
                  </label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      isSuspend
                        ? 'e.g. Temporary closure or health inspection flag'
                        : 'e.g. Invalid or expired FSSAI registration'
                    }
                    className="w-full h-20 p-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary resize-none text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant={isApprove ? 'primary' : isChanges ? 'outline' : 'danger'}
                size="sm"
                loading={verifyMutation.isPending}
                onClick={handleConfirm}
              >
                {isApprove
                  ? 'Confirm Approval'
                  : isChanges
                    ? 'Send Changes Request'
                    : isSuspend
                      ? 'Confirm Suspension'
                      : 'Confirm Rejection'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
