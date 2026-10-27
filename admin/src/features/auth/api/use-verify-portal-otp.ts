import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeSession } from '../lib/session';
import { authApi } from './auth.api';

export const useVerifyPortalOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authApi.verifyPortalOtp(email, otp),
    onSuccess: (auth) => storeSession(queryClient, auth),
  });
};
