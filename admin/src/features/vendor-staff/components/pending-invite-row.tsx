import { Mail, RotateCw, X } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { formatDateIST } from '@/utils/format';
import type { StaffInvitation } from '../api';

interface PendingInviteRowProps {
  invitation: StaffInvitation;
  onResend: (invitation: StaffInvitation) => void;
  onCancel: (invitation: StaffInvitation) => void;
  resending: boolean;
}

/** An invite that hasn't been accepted yet. */
export function PendingInviteRow({ invitation, onResend, onCancel, resending }: PendingInviteRowProps) {
  const expiry = `${invitation.isExpired ? 'Expired' : 'Link works until'} ${formatDateIST(invitation.expiresAt)}`;
  const details = [invitation.dutyTitle, invitation.name ? invitation.email : null, expiry].filter(Boolean).join(' · ');

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Mail aria-hidden="true" className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-text">{invitation.name || invitation.email}</span>
          {invitation.isExpired ? (
            <Badge tone="danger" size="sm">
              Link expired
            </Badge>
          ) : (
            <Badge tone="info" size="sm">
              Invited
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted">{details}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResend(invitation)}
          loading={resending}
          leftIcon={!resending && <RotateCw className="h-3.5 w-3.5" />}
        >
          Resend
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onCancel(invitation)} leftIcon={<X className="h-3.5 w-3.5" />}>
          Cancel
        </Button>
      </div>
    </li>
  );
}
