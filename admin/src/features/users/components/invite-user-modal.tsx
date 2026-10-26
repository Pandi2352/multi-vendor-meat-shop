import { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Button, CustomSelect, type SelectOption } from '@/components/ui';
import { useInviteUser, type UserRole } from '../api';

const INVITABLE_ROLES: (SelectOption & { value: UserRole })[] = [
  { value: 'ADMIN', label: 'Admin', description: 'Full system management & configuration', group: 'Platform Team' },
  { value: 'OPERATIONS', label: 'Operations Staff', description: 'Verifies stalls, catalog and tasks', group: 'Platform Team' },
  { value: 'FINANCE', label: 'Finance Manager', description: 'Manages ledger, refunds and payouts', group: 'Platform Team' },
  { value: 'SUPPORT', label: 'Customer Support', description: 'Manages tickets and customer issues', group: 'Platform Team' },
  { value: 'VENDOR_OWNER', label: 'Butcher Stall Owner', description: 'Controls stall profile and stock batches', group: 'Partners' },
  { value: 'VENDOR_STAFF', label: 'Stall Staff / Butcher', description: 'Prepares and cuts meat orders', group: 'Partners' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner', description: 'Picks up packets and delivers', group: 'Partners' },
];

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATIONS');
  const inviteMutation = useInviteUser();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteMutation.mutate(
      {
        email: email.trim(),
        name: name.trim() || undefined,
        role,
      },
      {
        onSuccess: () => {
          setEmail('');
          setName('');
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-text">Invite Portal User</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {inviteMutation.isError && (
            <div className="p-3 rounded-md bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to send invitation. Check if email already has an active account.</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-sm text-text mb-1.5">Email Address *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@yourshop.in"
              className="h-10 w-full px-3 rounded-md border border-border bg-surface text-sm text-text placeholder:text-muted/70 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-text mb-1.5">Full Name (Optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S. Murugesan"
              className="h-10 w-full px-3 rounded-md border border-border bg-surface text-sm text-text placeholder:text-muted/70 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-text mb-1.5">Assigned Role *</label>
            <CustomSelect
              value={role}
              onChange={(val) => setRole(val as UserRole)}
              options={INVITABLE_ROLES}
              searchable
              clearable={false}
              placeholder="Select assigned role..."
            />
          </div>

          <p className="text-xs text-muted leading-relaxed pt-0.5">
            An onboarding invitation will be registered. When the user signs in with this email, they will be granted the selected role.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={inviteMutation.isPending}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
