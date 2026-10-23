import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type SentOtpResponse = components['schemas']['SentOtpResponseDto'];
export type AuthResponse = components['schemas']['AuthResponseDto'];

// Paths are relative to `env.VITE_API_BASE_URL`, which already ends in /api/v1.
export const AUTH_ENDPOINTS = {
  PORTAL_OTP_SEND: '/auth/portal/otp/send',
  PORTAL_OTP_VERIFY: '/auth/portal/otp/verify',
} as const;

/** Admin portal (invite-only) sign-in. */
export const authApi = {
  sendPortalOtp: (email: string): Promise<SentOtpResponse> =>
    http.post<SentOtpResponse>(AUTH_ENDPOINTS.PORTAL_OTP_SEND, { email }),
};
