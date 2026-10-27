import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolvePostLoginPath } from '../lib/role-home';
import type { SessionUser } from '../lib/session';

/** After any successful sign-in: go back to `?next=` when safe, otherwise to the role's home. */
export const usePostLoginRedirect = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  return useCallback(
    (user: SessionUser) => navigate(resolvePostLoginPath(user.role, params.get('next')), { replace: true }),
    [navigate, params],
  );
};
