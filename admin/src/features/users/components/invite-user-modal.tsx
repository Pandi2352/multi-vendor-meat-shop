import { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useInviteUser, type UserRole } from '../api';

const INVITABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin (System Administrator)' },
  { value: 'OPERATIONS', label: 'Operations Staff' },
  { value: 'FINANCE', label: 'Finance Manager' },
  { value: 'SUPPORT', label: 'Customer Support' },
  { value: 'VENDOR_OWNER', label: 'Butcher Stall Owner' },
  { value: 'VENDOR_STAFF', label: 'Stall Staff / Butcher' },
  { value: 'DELIVERY_PARTNER', label: 'Delivery Partner' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Invite Portal User</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {inviteMutation.isError && (
            <div className="p-2.5 rounded-md bg-danger-soft border border-danger/20 text-danger flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Failed to send invitation. Check if email already has an active account.</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-text mb-1">Email Address *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@yourshop.in"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium text-text mb-1">Full Name (Optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S. Murugesan"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium text-text mb-1">Assigned Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            >
              {INVITABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-muted leading-relaxed pt-1">
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
