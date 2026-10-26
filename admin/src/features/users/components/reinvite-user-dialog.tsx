import { useState } from 'react';
import { X, Send, Link2, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useReinviteUser, type AdminUser, type UserInvitation } from '../api';

interface ReinviteUserDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function ReinviteUserDialog({ user, onClose }: ReinviteUserDialogProps) {
  const [copied, setCopied] = useState(false);
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

  const inviteUrl = createdInvite?.token
    ? `${window.location.origin}/accept-invite?token=${encodeURIComponent(createdInvite.token)}`
    : '';

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              Generate a fresh onboarding invitation link for this user. They can use this link to set their password and access their assigned role.
            </p>

            <div className="p-3 rounded-md bg-surface-muted border border-border text-xs space-y-0.5">
              <p className="font-semibold text-text">{user.name || 'Virudhunagar User'}</p>
              <p className="text-muted">{user.email}</p>
              <p className="text-muted">Role: <span className="font-medium text-text">{user.role}</span></p>
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
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Invitation generated and activated for 7 days!</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted">Direct Invitation Link:</label>
              <div className="p-2.5 rounded-md bg-surface-muted border border-border text-xs text-text break-all select-all font-mono">
                {inviteUrl}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="primary"
                size="sm"
                leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                onClick={handleCopy}
              >
                {copied ? 'Copied Link!' : 'Copy Invite Link'}
              </Button>
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
