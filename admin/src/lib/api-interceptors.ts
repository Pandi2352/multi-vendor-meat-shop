import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { env } from '@/config/env';
import { ApiError, type BackendErrorResponse } from './api-error';
import { tokenStorage } from './token-storage';

interface RetryQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

const processQueue = (error: Error | null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

/** Clear user session and immediately navigate to the login page on authentication failure */
const redirectToLogin = (reason = 'expired'): void => {
  tokenStorage.clearTokens();
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (!path.startsWith('/login') && !path.startsWith('/accept-invite')) {
      window.location.replace(`/login?reason=${reason}`);
    }
  }
};

export const setupInterceptors = (client: AxiosInstance): void => {
  // 1. Request Interceptor: Attach Bearer Token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // 2. Response Interceptor: Unwrap Envelope & Handle 401 Refresh Queue
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError<BackendErrorResponse>) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
      const status = error.response?.status;
      const errorBody = error.response?.data?.error;

      // 401 Unauthorized handling with token refresh
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
      if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
          redirectToLogin('expired');
          return Promise.reject(new ApiError(401, errorBody || { message: 'Session expired' }));
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => client(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post<{
            success: boolean;
            data: { accessToken: string; refreshToken: string };
          }>(
            `${env.VITE_API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          );

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
          tokenStorage.setAccessToken(accessToken);
          if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);

          processQueue(null);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr instanceof Error ? refreshErr : new Error('Refresh failed'));
          redirectToLogin('expired');
          return Promise.reject(new ApiError(401, { message: 'Session expired, please sign in again' }));
        } finally {
          isRefreshing = false;
        }
      }

      // If already retried or unrecoverable 401 on non-auth endpoint, navigate to login
      if (status === 401 && !isAuthEndpoint) {
        redirectToLogin('expired');
      }

      // Format any other error as standard ApiError
      const apiError = new ApiError(status ?? 500, errorBody || { message: error.message });
      return Promise.reject(apiError);
    },
  );
};
