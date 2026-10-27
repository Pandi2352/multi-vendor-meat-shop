import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storeSession } from '../lib/session';
import { authApi, type InvitationDetailsResponse } from './auth.api';

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
    onSuccess: (auth) => storeSession(queryClient, auth),
  });
};
