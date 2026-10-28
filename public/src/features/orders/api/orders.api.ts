import { http, type PaginatedResponse } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type OrderResponse = components['schemas']['OrderResponseDto'];
export type OrderItem = components['schemas']['OrderItemResponseDto'];
export type OrderEvent = components['schemas']['OrderEventResponseDto'];
export type CreateOrderBody = components['schemas']['CreateOrderDto'] & {
  couponCode?: string;
};
export type CancelOrderBody = components['schemas']['CancelOrderDto'];

export interface ReorderResponse {
  success: boolean;
  shopId: string;
  shopName: string;
  itemsAdded: number;
  skippedItems: Array<{ productName: string; reason: string }>;
  cart: unknown;
}

export type DeliveryTaskResponse = components['schemas']['DeliveryTaskResponseDto'];

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<OrderResponse>> =>
    http.getPaginated<OrderResponse>('/api/v1/orders', params),

  detail: (id: string): Promise<OrderResponse> =>
    http.get<OrderResponse>(`/api/v1/orders/${encodeURIComponent(id)}`),

  create: (body: CreateOrderBody): Promise<OrderResponse> =>
    http.post<OrderResponse>('/api/v1/orders', body),

  cancel: (id: string, body?: CancelOrderBody): Promise<OrderResponse> =>
    http.post<OrderResponse>(`/api/v1/orders/${encodeURIComponent(id)}/cancel`, body ?? {}),

  getDeliveryTask: (orderId: string): Promise<DeliveryTaskResponse> =>
    http.get<DeliveryTaskResponse>(`/api/v1/delivery/tasks/order/${encodeURIComponent(orderId)}`),

  resendDeliveryOtp: (orderId: string): Promise<{ success: boolean; maskedEmail: string; message: string }> =>
    http.post<{ success: boolean; maskedEmail: string; message: string }>(
      `/api/v1/delivery/tasks/order/${encodeURIComponent(orderId)}/resend-otp`,
    ),

  reorder: (id: string): Promise<ReorderResponse> =>
    http.post<ReorderResponse>(`/api/v1/orders/${encodeURIComponent(id)}/reorder`),
};
