import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/api-error';
import { storeSession } from '../lib/session';
import { authApi, type PasswordResetDetails } from './auth.api';

export type ResetLinkProblem = 'invalid' | 'used' | 'expired';

/** Which problem the server reported for a reset link (RESET_LINK_INVALID → details.problem). */
export const getResetLinkProblem = (error: unknown): ResetLinkProblem => {
  if (isApiError(error) && error.code === 'RESET_LINK_INVALID') {
    const problem = (error.details as { problem?: string } | undefined)?.problem;
    if (problem === 'used' || problem === 'expired') return problem;
  }
  return 'invalid';
};

export const useRequestPasswordReset = () =>
  useMutation({ mutationFn: (email: string) => authApi.requestPasswordReset(email) });

export const usePasswordResetDetails = (token: string) =>
  useQuery<PasswordResetDetails>({
    queryKey: ['portal-password-reset', token],
    queryFn: () => authApi.getPasswordReset(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { token: string; password: string }) => authApi.resetPassword(data),
    onSuccess: (auth) => storeSession(queryClient, auth),
  });
};
