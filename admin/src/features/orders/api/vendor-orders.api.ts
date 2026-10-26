import { http, type PaginatedResponse } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type OrderResponse = components['schemas']['OrderResponseDto'];
export type OrderItem = components['schemas']['OrderItemResponseDto'];
export type OrderEvent = components['schemas']['OrderEventResponseDto'];
export type UpdateOrderStatusBody = components['schemas']['UpdateOrderStatusDto'];

export interface VendorOrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
}

export const vendorOrdersApi = {
  list: (params?: VendorOrderListParams): Promise<PaginatedResponse<OrderResponse>> =>
    http.getPaginated<OrderResponse>('/vendor/orders', params as Record<string, unknown>),

  detail: (id: string): Promise<OrderResponse> =>
    http.get<OrderResponse>(`/vendor/orders/${encodeURIComponent(id)}`),

  updateStatus: (id: string, body: UpdateOrderStatusBody): Promise<OrderResponse> =>
    http.patch<OrderResponse>(`/vendor/orders/${encodeURIComponent(id)}/status`, body),
};
