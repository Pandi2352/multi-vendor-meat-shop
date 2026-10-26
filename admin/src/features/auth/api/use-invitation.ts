import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token-storage';
import { authApi, type AuthResponse, type InvitationDetailsResponse } from './auth.api';

export const useInvitationDetails = (token: string) =>
  useQuery<InvitationDetailsResponse>({
    queryKey: ['portal-invitation', token],
    queryFn: () => authApi.getInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { token: string; password: string; name?: string }) =>
      authApi.acceptInvitation(data),
    onSuccess: (data: AuthResponse) => {
      tokenStorage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
      }
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
};
