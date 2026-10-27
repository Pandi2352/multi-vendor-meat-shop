import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeSession } from '../lib/session';
import { authApi } from './auth.api';

export const usePortalLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.loginWithPassword(data),
    onSuccess: (auth) => storeSession(queryClient, auth),
  });
};
