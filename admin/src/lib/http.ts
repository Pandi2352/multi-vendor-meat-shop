import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api-client';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.get<ApiResponse<T>>(url, config);
    return res.data.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.post<ApiResponse<T>>(url, data, config);
    return res.data.data;
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return res.data.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.put<ApiResponse<T>>(url, data, config);
    return res.data.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await apiClient.delete<ApiResponse<T>>(url, config);
    return res.data.data;
  },

  getPaginated: async <T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedResponse<T>> => {
    const res = await apiClient.get<ApiResponse<T[]>>(url, { ...config, params: { ...config?.params, ...params } });
    return {
      items: res.data.data ?? [],
      meta: res.data.meta ?? {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  },
};
