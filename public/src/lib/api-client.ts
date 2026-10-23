import axios, { type AxiosInstance } from 'axios';
import { env } from '@/config/env';
import { setupInterceptors } from './api-interceptors';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);

export * from './api-error';
export * from './http';
export * from './token-storage';
