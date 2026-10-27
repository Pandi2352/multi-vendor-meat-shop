import type { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
// Direct path, not the layout barrel (avoids an import cycle through AdminLayout).
import { ForbiddenPage } from '@/components/layout/forbidden-page';
import { canAccessPath } from '@/config/route-access';
import { ROUTES } from '@/config/routes';
import { useSession } from '../api/use-session';
import { getRoleHome } from '../lib/role-home';

/**
 * Wraps the routed page inside the portal layout. Opening `/` without access goes to the role's
 * home; any other page the role can't use shows a 403 inside the layout (the sidebar stays usable).
 */
export function RouteAccessGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = useSession();

  if (session.status !== 'authenticated') return null;
  const { role } = session.user;
  if (canAccessPath(role, pathname)) return <>{children}</>;

  const home = getRoleHome(role);
  if (pathname === ROUTES.DASHBOARD) return <Navigate to={home} replace />;

  return (
    <ForbiddenPage
      title="This page isn’t part of your workspace"
      description="Your role doesn’t include this page. If you need it, ask your shop owner or an administrator to change your access."
      homeLabel="Go to my home"
      onGoHome={() => navigate(home)}
    />
  );
}
