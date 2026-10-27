import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Direct paths, not the layout barrel: the barrel re-exports AdminLayout, which imports this feature.
import { FullPageLoader } from '@/components/layout/FullPageLoader';
import { ServerErrorPage } from '@/components/layout/server-error-page';
import { ROUTES } from '@/config/routes';
import { isPortalRole } from '@/constants/roles';
import { isApiError } from '@/lib/api-error';
import { useSession } from '../api/use-session';
import { SIGN_IN_REASON } from '../constants/sign-in-reasons';
import { buildLoginPath } from '../lib/role-home';

/**
 * Gate for every portal page. Signed out → sign-in (remembering where you were);
 * customer account → no-access screen; suspended → suspended screen.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const location = useLocation();
  const session = useSession();

  const next = location.pathname + location.search;
  if (session.status === 'anonymous') return <Navigate to={buildLoginPath({ next })} replace />;
  if (session.status === 'expired') {
    return <Navigate to={buildLoginPath({ reason: SIGN_IN_REASON.SESSION_EXPIRED, next })} replace />;
  }
  if (session.status === 'loading') return <FullPageLoader />;
  if (session.status === 'error') {
    if (isApiError(session.error) && session.error.code === 'ACCOUNT_SUSPENDED') {
      return <Navigate to={ROUTES.SUSPENDED} replace />;
    }
    return <ServerErrorPage onRetry={session.retry} />;
  }

  const { user } = session;
  if (user.status === 'SUSPENDED') return <Navigate to={ROUTES.SUSPENDED} replace />;
  if (!isPortalRole(user.role)) return <Navigate to={ROUTES.ACCESS_DENIED} replace />;
  return <>{children}</>;
}
