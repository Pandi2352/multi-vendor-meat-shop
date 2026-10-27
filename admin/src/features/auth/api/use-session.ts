import { useQuery } from '@tanstack/react-query';
import { getStatusCode, isApiError } from '@/lib/api-error';
import { tokenStorage } from '@/lib/token-storage';
import { SESSION_QUERY_KEY, type SessionUser } from '../lib/session';
import { authApi } from './auth.api';

export type Session =
  | { status: 'anonymous' }
  /** Had a session, but it could not be refreshed (revoked or expired). */
  | { status: 'expired' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: SessionUser }
  | { status: 'error'; error: unknown; retry: () => void };

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * The signed-in user from `GET /auth/me`. Renders instantly from the user cached at sign-in,
 * then refetches so a changed role or suspension takes effect on the next page load.
 */
export const useSession = (): Session => {
  const hasToken = Boolean(tokenStorage.getAccessToken());

  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const user = await authApi.me();
      tokenStorage.setUser(user);
      return user;
    },
    enabled: hasToken,
    initialData: () => tokenStorage.getUser<SessionUser>() ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: FIVE_MINUTES,
    // Retry network/server errors, never auth errors.
    retry: (count, error) => (isApiError(error) && error.status < 500 ? false : count < 2),
  });

  // Checked before `hasToken`: on a 401 the interceptor has already cleared the tokens.
  if (query.isError && getStatusCode(query.error) === 401) return { status: 'expired' };
  if (!hasToken) return { status: 'anonymous' };
  if (query.data) return { status: 'authenticated', user: query.data };
  if (query.isError) return { status: 'error', error: query.error, retry: () => void query.refetch() };
  return { status: 'loading' };
};
