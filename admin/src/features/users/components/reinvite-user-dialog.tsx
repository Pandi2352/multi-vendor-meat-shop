import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { useReinviteUser, type AdminUser, type UserInvitation } from '../api';
import { InvitationResult } from './invitation-result';

interface ReinviteUserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function ReinviteUserDialog({ user, onClose }: ReinviteUserDialogProps) {
  const [createdInvite, setCreatedInvite] = useState<UserInvitation | null>(null);
  const reinviteMutation = useReinviteUser();

  if (!user) return null;

  const handleReinvite = () => {
    reinviteMutation.mutate(user.id, {
      onSuccess: (data) => {
        setCreatedInvite(data);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-semibold text-text">Re-invite User</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!createdInvite ? (
          <div className="space-y-3">
            <p className="text-xs text-muted leading-relaxed">
              Email this user a fresh invitation. Any earlier link stops working; the new one lets
              them set a password for their role.
            </p>

            <div className="p-3 rounded-md bg-surface-muted border border-border text-xs space-y-0.5">
              <p className="font-semibold text-text">{user.name || 'Virudhunagar User'}</p>
              <p className="text-muted">{user.email}</p>
              <p className="text-muted">
                Role: <span className="font-medium text-text">{user.role}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={reinviteMutation.isPending}
                leftIcon={<Send className="h-3.5 w-3.5" />}
                onClick={handleReinvite}
              >
                Send Re-invite
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <InvitationResult invitation={createdInvite} />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
