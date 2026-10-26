import { useMutation } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token-storage';
import { authApi, type AuthResponse } from './auth.api';

export const useVerifyPortalOtp = () =>
  useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyPortalOtp(email, otp),
    onSuccess: (data: AuthResponse) => {
      tokenStorage.setAccessToken(data.accessToken);
      tokenStorage.setRefreshToken(data.refreshToken);
    },
  });
