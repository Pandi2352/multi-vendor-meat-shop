import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUpdateUserStatus, type AdminUser, type UserStatus } from '../api';

const STATUS_OPTIONS: { value: UserStatus; label: string; tone: 'success' | 'warning' | 'danger' }[] = [
  { value: 'ACTIVE', label: 'Active (Allow full portal/storefront access)', tone: 'success' },
  { value: 'INACTIVE', label: 'Inactive (Temporarily disable login)', tone: 'warning' },
  { value: 'SUSPENDED', label: 'Suspended (Block account from all actions)', tone: 'danger' },
];

interface UserStatusDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function UserStatusDialog({ user, onClose }: UserStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user?.status ?? 'ACTIVE');
  const statusMutation = useUpdateUserStatus();

  if (!user) return null;

  const handleConfirm = () => {
    statusMutation.mutate(
      {
        userId: user.id,
        data: { status: selectedStatus },
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
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="text-base font-semibold text-text">Update User Status</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 rounded-md bg-surface-muted border border-border text-xs space-y-0.5">
          <p className="font-semibold text-text">{user.name || 'Unnamed User'}</p>
          <p className="text-muted">{user.email}</p>
          <p className="text-muted">Current Status: <span className="font-medium text-text">{user.status}</span></p>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block font-medium text-text">Select Status:</label>
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`p-2.5 rounded-md border flex items-center gap-2.5 cursor-pointer transition-colors ${
                selectedStatus === opt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-surface hover:bg-surface-muted'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={selectedStatus === opt.value}
                onChange={() => setSelectedStatus(opt.value)}
                className="text-primary focus:ring-0"
              />
              <span className="text-text font-medium">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={statusMutation.isPending}
            onClick={handleConfirm}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
