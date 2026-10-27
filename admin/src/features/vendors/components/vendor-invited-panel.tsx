import type { ReactNode } from 'react';
import { Button } from '@/components/ui';
import { InvitationResult, type IssuedInvitation } from '@/features/users';

interface VendorInvitedPanelProps {
  /** What just happened, e.g. "<shop> is approved." */
  message: ReactNode;
  invitation: IssuedInvitation;
  onDone: () => void;
}

/** Shown after creating or approving a vendor: confirms the owner was invited and how. */
export function VendorInvitedPanel({ message, invitation, onDone }: VendorInvitedPanelProps) {
  return (
    <div className="space-y-4 text-xs">
      <p className="text-muted">{message}</p>
      <InvitationResult invitation={invitation} />
      <div className="flex justify-end border-t border-border pt-3">
        <Button variant="outline" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
