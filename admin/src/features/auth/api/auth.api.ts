import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type SentOtpResponse = components['schemas']['SentOtpResponseDto'];
export type AuthResponse = components['schemas']['AuthResponseDto'];

export type InvitationDetailsResponse = components['schemas']['InvitationDetailsResponseDto'];
export type PasswordResetDetails = components['schemas']['PasswordResetDetailsResponseDto'];

// Paths are relative to `env.VITE_API_BASE_URL`, which ends in /api/v1.
export const AUTH_ENDPOINTS = {
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  PORTAL_LOGIN: '/auth/portal/login',
  PORTAL_INVITATION: (token: string) => `/auth/portal/invitations/${encodeURIComponent(token)}`,
  PORTAL_ACCEPT_INVITATION: '/auth/portal/invitations/accept',
  PORTAL_OTP_SEND: '/auth/portal/otp/send',
  PORTAL_OTP_VERIFY: '/auth/portal/otp/verify',
  PASSWORD_FORGOT: '/auth/portal/password/forgot',
  PASSWORD_RESET_DETAILS: (token: string) => `/auth/portal/password/reset/${encodeURIComponent(token)}`,
  PASSWORD_RESET: '/auth/portal/password/reset',
} as const;

/** Admin portal authentication: Email + Password and Invitation acceptance */
export const authApi = {
  loginWithPassword: (data: { email: string; password: string }): Promise<AuthResponse> =>
    http.post<AuthResponse>(AUTH_ENDPOINTS.PORTAL_LOGIN, data),

  getInvitation: (token: string): Promise<InvitationDetailsResponse> =>
    http.get<InvitationDetailsResponse>(AUTH_ENDPOINTS.PORTAL_INVITATION(token)),

  acceptInvitation: (data: { token: string; password: string; name?: string }): Promise<AuthResponse> =>
    http.post<AuthResponse>(AUTH_ENDPOINTS.PORTAL_ACCEPT_INVITATION, data),

  sendPortalOtp: (email: string): Promise<SentOtpResponse> =>
    http.post<SentOtpResponse>(AUTH_ENDPOINTS.PORTAL_OTP_SEND, { email }),

  verifyPortalOtp: (email: string, otp: string): Promise<AuthResponse> =>
    http.post<AuthResponse>(AUTH_ENDPOINTS.PORTAL_OTP_VERIFY, { email, otp }),

  /** Always answers sent, whether or not the email has an account. */
  requestPasswordReset: (email: string): Promise<SentOtpResponse> =>
    http.post<SentOtpResponse>(AUTH_ENDPOINTS.PASSWORD_FORGOT, { email }),

  getPasswordReset: (token: string): Promise<PasswordResetDetails> =>
    http.get<PasswordResetDetails>(AUTH_ENDPOINTS.PASSWORD_RESET_DETAILS(token)),

  resetPassword: (data: { token: string; password: string }): Promise<AuthResponse> =>
    http.post<AuthResponse>(AUTH_ENDPOINTS.PASSWORD_RESET, data),

  me: (): Promise<AuthResponse['user']> => http.get<AuthResponse['user']>(AUTH_ENDPOINTS.ME),

  /** Revokes the user's refresh sessions on the server. */
  logout: (): Promise<unknown> => http.post(AUTH_ENDPOINTS.LOGOUT),
};
