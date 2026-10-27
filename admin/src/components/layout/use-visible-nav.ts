import { useMemo } from 'react';
import type { NavSection } from '@/config/nav.config';
import { filterNavForRole } from '@/config/nav.utils';
import { useCurrentUser } from '@/features/auth';

/** Nav sections the signed-in user may see. Sidebar, breadcrumb and search all read from here. */
export const useVisibleNav = (): NavSection[] => {
  const role = useCurrentUser()?.role;
  return useMemo(() => (role ? filterNavForRole(role) : []), [role]);
};
