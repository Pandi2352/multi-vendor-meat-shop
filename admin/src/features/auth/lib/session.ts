import type { QueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token-storage';
import type { AuthResponse } from '../api/auth.api';

export type SessionUser = AuthResponse['user'];

/** Query key for the signed-in user (`GET /auth/me`). Shared by the session guard and `useCurrentUser`. */
export const SESSION_QUERY_KEY = ['currentUser'] as const;

/** Persists a fresh sign-in (password, code or accepted invite) and primes the user cache. */
export const storeSession = (queryClient: QueryClient, auth: AuthResponse): void => {
  tokenStorage.setAccessToken(auth.accessToken);
  if (auth.refreshToken) tokenStorage.setRefreshToken(auth.refreshToken);
  tokenStorage.setUser(auth.user);
  queryClient.setQueryData(SESSION_QUERY_KEY, auth.user);
};

/** Forgets the session locally: tokens, cached user, and every cached query (no data leaks to the next user). */
export const clearSession = (queryClient: QueryClient): void => {
  tokenStorage.clearTokens();
  queryClient.clear();
};
