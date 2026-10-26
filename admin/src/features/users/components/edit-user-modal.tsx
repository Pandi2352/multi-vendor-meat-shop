import { useState, useEffect } from 'react';
import { X, UserCog } from 'lucide-react';
import { Button, Input, CustomSelect, type SelectOption } from '@/components/ui';
import { useEditUser, type AdminUser, type UserRole, type UserStatus } from '../api';

const ROLE_OPTIONS: SelectOption[] = [
  { label: 'Super Admin', value: 'SUPER_ADMIN', description: 'Platform owner' },
  { label: 'Admin', value: 'ADMIN', description: 'Operations & user manager' },
  { label: 'Operations Staff', value: 'OPERATIONS', description: 'Verifications & orders' },
  { label: 'Finance Manager', value: 'FINANCE', description: 'Settlements & payouts' },
  { label: 'Customer Support', value: 'SUPPORT', description: 'Tickets & disputes' },
  { label: 'Stall Owner', value: 'VENDOR_OWNER', description: 'Meat stall manager' },
  { label: 'Stall Staff / Butcher', value: 'VENDOR_STAFF', description: 'Meat preparation' },
  { label: 'Delivery Partner', value: 'DELIVERY_PARTNER', description: 'Order logistics' },
  { label: 'Customer', value: 'CUSTOMER', description: 'Storefront shopper' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Active', value: 'ACTIVE', description: 'Full access permitted' },
  { label: 'Inactive', value: 'INACTIVE', description: 'Account disabled' },
  { label: 'Suspended', value: 'SUSPENDED', description: 'Login blocked' },
];

interface EditUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const editMutation = useEditUser();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMutation.mutate(
      {
        userId: user.id,
        data: {
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          role,
          status,
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
            <UserCog className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-semibold text-text">Edit User Profile</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Email Address</label>
            <Input value={user.email} disabled className="bg-surface-muted opacity-80 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saravanan Pandian"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +919876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Assigned Role</label>
            <CustomSelect
              value={role}
              onChange={(val) => setRole(val as UserRole)}
              options={ROLE_OPTIONS}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Account Status</label>
            <CustomSelect
              value={status}
              onChange={(val) => setStatus(val as UserStatus)}
              options={STATUS_OPTIONS}
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
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
