import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
// Direct path, not the layout barrel (avoids an import cycle through AdminLayout).
import { FullPageLoader } from '@/components/layout/FullPageLoader';
import { isPortalRole } from '@/constants/roles';
import { useSession } from '../api/use-session';
import { resolvePostLoginPath } from '../lib/role-home';

/** For sign-in pages: someone already signed in goes straight to their home (or `?next=`). */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const session = useSession();

  if (session.status === 'loading') return <FullPageLoader label="Checking your session…" />;
  if (session.status === 'authenticated' && isPortalRole(session.user.role) && session.user.status !== 'SUSPENDED') {
    return <Navigate to={resolvePostLoginPath(session.user.role, params.get('next'))} replace />;
  }
  return <>{children}</>;
}
