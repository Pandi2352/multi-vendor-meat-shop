import { useState } from 'react';
import { X, Store } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks';
import type { VendorProfile } from '../api';
import { AddVendorForm } from './add-vendor-form';
import { VendorInvitedPanel } from './vendor-invited-panel';

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVendorModal({ isOpen, onClose }: AddVendorModalProps) {
  useBodyScrollLock(isOpen);
  const [created, setCreated] = useState<VendorProfile | null>(null);

  const close = () => {
    setCreated(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-5xl lg:max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text">Add New Butcher Stall / புதிய கடை</h2>
          </div>
          <button
            onClick={close}
            className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {created?.invitation ? (
          <div className="p-4">
            <VendorInvitedPanel
              message={
                <>
                  <strong className="text-text">{created.businessName}</strong> is set up and
                  approved. The owner signs in after setting a password from the invitation.
                </>
              }
              invitation={created.invitation}
              onDone={close}
            />
          </div>
        ) : (
          <AddVendorForm
            onCreated={(vendor) => (vendor.invitation ? setCreated(vendor) : close())}
            onCancel={close}
          />
        )}
      </div>
    </div>
  );
}
