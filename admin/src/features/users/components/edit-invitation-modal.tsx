import { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
import { Button, Input, CustomSelect, type SelectOption } from '@/components/ui';
import { useEditInvitation, type UserInvitation, type UserRole } from '../api';

const ROLE_OPTIONS: SelectOption[] = [
  { label: 'Admin', value: 'ADMIN', description: 'Operations & user manager' },
  { label: 'Operations Staff', value: 'OPERATIONS', description: 'Verifications & orders' },
  { label: 'Finance Manager', value: 'FINANCE', description: 'Settlements & payouts' },
  { label: 'Customer Support', value: 'SUPPORT', description: 'Tickets & disputes' },
  { label: 'Stall Owner', value: 'VENDOR_OWNER', description: 'Meat stall manager' },
  { label: 'Stall Staff / Butcher', value: 'VENDOR_STAFF', description: 'Meat preparation' },
  { label: 'Delivery Partner', value: 'DELIVERY_PARTNER', description: 'Order logistics' },
];

interface EditInvitationModalProps {
  invitation: UserInvitation | null;
  onClose: () => void;
}

export function EditInvitationModal({ invitation, onClose }: EditInvitationModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATIONS');
  const editMutation = useEditInvitation();

  useEffect(() => {
    if (invitation) {
      setName(invitation.name || '');
      setRole(invitation.role);
    }
  }, [invitation]);

  if (!invitation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMutation.mutate(
      {
        id: invitation.id,
        data: {
          name: name.trim() || undefined,
          role,
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-semibold text-text">Edit Invitation</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Invited Email</label>
            <Input value={invitation.email} disabled className="bg-surface-muted opacity-80 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Invited Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Butcher"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Assign Role</label>
            <CustomSelect
              value={role}
              onChange={(val) => setRole(val as UserRole)}
              options={ROLE_OPTIONS}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={editMutation.isPending}
            >
              Update Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
