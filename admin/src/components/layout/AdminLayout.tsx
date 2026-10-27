import { Suspense, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { RouteAccessGuard } from '@/features/auth';
import { useIsDesktop, usePersistedState } from '@/hooks';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

/** Shell for every signed-in admin page: sidebar + navbar + routed content. */
export function AdminLayout() {
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = usePersistedState('sidebar-collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleSidebar = useCallback(() => {
    if (isDesktop) setCollapsed((v) => !v);
    else setMobileOpen((v) => !v);
  }, [isDesktop, setCollapsed]);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar collapsed={collapsed} isDesktop={isDesktop} mobileOpen={mobileOpen} onMobileClose={closeMobile} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar collapsed={collapsed} isDesktop={isDesktop} onToggleSidebar={toggleSidebar} />
        {/* Full-width content: pages fill the space beside the sidebar cleanly with no empty void. */}
        <main id="main-content" className="w-full min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <Suspense
            fallback={
              <div className="flex justify-center py-24">
                <Spinner />
              </div>
            }
          >
            <RouteAccessGuard>
              <Outlet />
            </RouteAccessGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
