import { useCallback } from 'react';
import type { Permission } from '@/constants/permissions';
import { useSession } from './use-session';

/**
 * `(…permissions) => boolean` for the signed-in user (from `/auth/me`), for lists where each item
 * needs its own check. Use it to hide actions the API would refuse.
 */
export const usePermissionCheck = () => {
  const session = useSession();
  // `?? []`: a user cached before permissions were added has none until /auth/me refreshes it.
  const granted = session.status === 'authenticated' ? (session.user.permissions ?? []) : null;
  return useCallback(
    (...required: Permission[]) => !!granted && required.every((permission) => granted.includes(permission)),
    [granted],
  );
};

/** True when the signed-in user holds every listed permission, e.g. `useHasPermission('product.manage')`. */
export const useHasPermission = (...required: Permission[]): boolean => usePermissionCheck()(...required);
