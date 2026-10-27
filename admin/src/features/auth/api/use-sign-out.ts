import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { tokenStorage } from '@/lib/token-storage';
import { SIGN_IN_REASON } from '../constants/sign-in-reasons';
import { clearSession } from '../lib/session';
import { authApi } from './auth.api';

/** Revokes the server sessions (best effort), forgets everything locally and returns to sign-in. */
export const useSignOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      if (tokenStorage.getAccessToken()) await authApi.logout();
    } catch {
      // Offline or token already invalid: still sign out locally.
    } finally {
      clearSession(queryClient);
      navigate(`${ROUTES.LOGIN}?reason=${SIGN_IN_REASON.SIGNED_OUT}`, { replace: true });
    }
  }, [navigate, queryClient]);
};
