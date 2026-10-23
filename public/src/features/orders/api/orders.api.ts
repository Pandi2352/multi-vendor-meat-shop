import { http, type PaginatedResponse } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type OrderResponse = components['schemas']['OrderResponseDto'];
export type OrderItem = components['schemas']['OrderItemResponseDto'];
export type OrderEvent = components['schemas']['OrderEventResponseDto'];
export type CreateOrderBody = components['schemas']['CreateOrderDto'];
export type CancelOrderBody = components['schemas']['CancelOrderDto'];

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<OrderResponse>> =>
    http.getPaginated<OrderResponse>('/api/v1/orders', params),

  detail: (id: string): Promise<OrderResponse> =>
    http.get<OrderResponse>(`/api/v1/orders/${encodeURIComponent(id)}`),

  create: (body: CreateOrderBody): Promise<OrderResponse> =>
    http.post<OrderResponse>('/api/v1/orders', body),

  cancel: (id: string, body?: CancelOrderBody): Promise<OrderResponse> =>
    http.post<OrderResponse>(`/api/v1/orders/${encodeURIComponent(id)}/cancel`, body ?? {}),
};
