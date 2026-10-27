import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { Alert, Button } from '@/components/ui';
import { formatDateIST } from '@/utils/format';

export interface IssuedInvitation {
  email: string;
  expiresAt: string;
  /** One-time set-password link, only present right after issuing. */
  inviteUrl?: string;
  emailSent?: boolean;
}

/**
 * What happened to an invitation the admin just issued: emailed (with the link as a backup), or
 * not emailed (the link is the only way to share it). The link is shown once — it is never stored.
 */
export function InvitationResult({ invitation }: { invitation: IssuedInvitation }) {
  const [copied, setCopied] = useState(false);
  const { inviteUrl, emailSent, email } = invitation;
  const expires = formatDateIST(invitation.expiresAt);

  const copy = () => {
    if (!inviteUrl) return;
    void navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {emailSent ? (
        <Alert tone="success" title={`Invitation emailed to ${email}`}>
          They can set a password from the link until {expires}.
        </Alert>
      ) : (
        <Alert tone="warning" title="The invitation email couldn’t be sent">
          Copy the link below and share it with {email} directly. It works once, until {expires}.
        </Alert>
      )}

      {inviteUrl && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted">{emailSent ? 'Backup link (shown only now)' : 'Invitation link (shown only now)'}</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface-muted px-2.5 py-2 font-mono text-xs text-text">
              {inviteUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copy}
              leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
