import { X, UserX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRevokeUser, type AdminUser } from '../api';

interface RevokeUserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function RevokeUserDialog({ user, onClose }: RevokeUserDialogProps) {
  const revokeMutation = useRevokeUser();

  if (!user) return null;

  const handleRevoke = () => {
    revokeMutation.mutate(user.id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-base font-semibold text-text">Revoke User Access</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-md bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Are you sure you want to revoke this user's access?</span>
          </div>
          <p className="text-rose-600/90 dark:text-rose-400 pl-5">
            This account will be suspended immediately. All current sessions will be terminated and pending onboarding invitations will be revoked.
          </p>
        </div>

        <div className="p-3 rounded-md bg-surface-muted border border-border text-xs space-y-1">
          <p className="font-semibold text-text">{user.name || 'Virudhunagar User'}</p>
          <p className="text-muted">{user.email}</p>
          <p className="text-muted">
            Role: <span className="font-medium text-text">{user.role}</span> | Status: <span className="font-medium text-text">{user.status}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={revokeMutation.isPending}
            onClick={handleRevoke}
          >
            Revoke Access
          </Button>
        </div>
      </div>
    </div>
  );
}
