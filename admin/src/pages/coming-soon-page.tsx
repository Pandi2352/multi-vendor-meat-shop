import { ArrowLeft, Hammer } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { buttonVariants } from '@/components/ui';
import { findNavEntry } from '@/config/nav.utils';
import { ROUTES } from '@/config/routes';

/** Placeholder for pages listed in the sidebar but not built yet. */
export function ComingSoonPage({ title }: { title?: string }) {
  const { pathname } = useLocation();
  const entry = findNavEntry(pathname);
  const name = title ?? entry?.label ?? 'This page';

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Hammer aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-semibold text-text">{name} is on the way</h1>
        {entry?.description && <p className="mt-2 text-sm font-medium text-text/80">{entry.description}</p>}
        <p className="mt-1 text-sm text-muted">This part of the operations portal is being built and will appear here once the module ships.</p>
        <Link to={ROUTES.DASHBOARD} className={buttonVariants({ variant: 'outline', size: 'sm', className: 'mt-6' })}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
