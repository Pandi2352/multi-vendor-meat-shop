import { Suspense, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui';
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
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense
              fallback={
                <div className="flex justify-center py-24">
                  <Spinner />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
