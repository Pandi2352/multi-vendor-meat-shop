import { useState, type ReactNode } from 'react';
import { LogOut, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { useSession } from '../api/use-session';
import { useSignOut } from '../api/use-sign-out';

interface AccessNoticeProps {
  icon: LucideIcon;
  tone: 'warning' | 'danger';
  title: string;
  children: ReactNode;
}

/** Shared body for the no-access and suspended screens: what happened, who you are, sign out. */
export function AccessNotice({ icon: Icon, tone, title, children }: AccessNoticeProps) {
  const session = useSession();
  const signOut = useSignOut();
  const [signingOut, setSigningOut] = useState(false);
  const email = session.status === 'authenticated' ? session.user.email : null;

  return (
    <div className="flex flex-col gap-6">
      <span
        className={
          tone === 'danger'
            ? 'flex h-11 w-11 items-center justify-center rounded-md bg-danger-soft text-danger'
            : 'flex h-11 w-11 items-center justify-center rounded-md bg-warning-soft text-warning'
        }
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        <div className="space-y-2 text-sm leading-6 text-muted">{children}</div>
      </header>

      {email && (
        <p className="rounded-md border border-border bg-surface-muted px-3.5 py-2.5 text-sm text-muted">
          Signed in as <span className="font-medium text-text">{email}</span>
        </p>
      )}

      <Button
        variant="outline"
        size="lg"
        fullWidth
        loading={signingOut}
        leftIcon={<LogOut className="h-4 w-4" />}
        onClick={() => {
          setSigningOut(true);
          void signOut();
        }}
      >
        Sign out and use another account
      </Button>
    </div>
  );
}
