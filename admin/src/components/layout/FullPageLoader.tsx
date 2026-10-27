import { Beef } from 'lucide-react';
import { Spinner } from '@/components/ui';

/** Shown while the session is being checked, before any layout renders. */
export function FullPageLoader({ label = 'Loading your portal…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Beef aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="flex items-center gap-2 text-sm text-muted">
        {/* The wrapper is the live region; hide the spinner's own status so it isn't announced twice. */}
        <span aria-hidden="true">
          <Spinner size="sm" />
        </span>
        {label}
      </span>
    </div>
  );
}
