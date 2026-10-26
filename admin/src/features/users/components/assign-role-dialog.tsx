import { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAssignRole, type AdminUser, type UserRole } from '../api';

const AVAILABLE_ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'ADMIN', label: 'Admin', desc: 'Full administration of marketplace' },
  { value: 'OPERATIONS', label: 'Operations', desc: 'Verifies stalls, catalog and tasks' },
  { value: 'FINANCE', label: 'Finance', desc: 'Manages ledger, refunds and payouts' },
  { value: 'SUPPORT', label: 'Support', desc: 'Manages tickets and customer issues' },
  { value: 'VENDOR_OWNER', label: 'Stall Owner', desc: 'Controls butcher stall and stock' },
  { value: 'VENDOR_STAFF', label: 'Stall Staff', desc: 'Prepares and cuts meat orders' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner', desc: 'Picks up packets and delivers' },
  { value: 'CUSTOMER', label: 'Customer', desc: 'Regular shopper storefront account' },
];

interface AssignRoleDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function AssignRoleDialog({ user, onClose }: AssignRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role ?? 'CUSTOMER');
  const assignMutation = useAssignRole();

  if (!user) return null;

  const handleConfirm = () => {
    assignMutation.mutate(
      {
        userId: user.id,
        data: { role: selectedRole },
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
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Assign User Role</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 rounded-md bg-surface-muted border border-border text-xs space-y-0.5">
          <p className="font-semibold text-text">{user.name || 'Unnamed User'}</p>
          <p className="text-muted">{user.email}</p>
          <p className="text-muted">Current Role: <span className="font-medium text-text">{user.role}</span></p>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
          <label className="block font-medium text-text mb-1">Select New Role:</label>
          {AVAILABLE_ROLES.map((r) => {
            const isSelected = selectedRole === r.value;
            return (
              <div
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`p-2.5 rounded-md border cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface hover:bg-surface-muted text-text'
                }`}
              >
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="text-[11px] text-muted">{r.desc}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={assignMutation.isPending}
            onClick={handleConfirm}
          >
            Confirm Role
          </Button>
        </div>
      </div>
    </div>
  );
}
