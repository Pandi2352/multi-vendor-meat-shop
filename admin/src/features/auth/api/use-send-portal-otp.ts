import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';

export const useSendPortalOtp = () =>
  useMutation({
    mutationFn: (email: string) => authApi.sendPortalOtp(email),
  });
