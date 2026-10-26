import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token-storage';
import { authApi, type AuthResponse } from './auth.api';

export const usePortalLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.loginWithPassword(data),
    onSuccess: (data: AuthResponse) => {
      tokenStorage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
      }
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
};
