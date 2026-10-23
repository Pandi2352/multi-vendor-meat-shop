import { http, type PaginatedResponse } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type DeliveryTaskResponse = components['schemas']['DeliveryTaskResponseDto'];
export type AssignDeliveryTaskBody = components['schemas']['AssignDeliveryTaskDto'];
export type VerifyDeliveryOtpBody = components['schemas']['VerifyDeliveryOtpDto'];

export interface DeliveryTaskListParams {
  page?: number;
  limit?: number;
  status?: string;
  partnerId?: string;
  shopId?: string;
  date?: string;
}

export const deliveryApi = {
  listTasks: (params?: DeliveryTaskListParams): Promise<PaginatedResponse<DeliveryTaskResponse>> =>
    http.getPaginated<DeliveryTaskResponse>('/api/v1/admin/delivery/tasks', params as Record<string, unknown>),

  getTask: (id: string): Promise<DeliveryTaskResponse> =>
    http.get<DeliveryTaskResponse>(`/api/v1/admin/delivery/tasks/${encodeURIComponent(id)}`),

  dispatchOrder: (orderId: string): Promise<DeliveryTaskResponse> =>
    http.post<DeliveryTaskResponse>(`/api/v1/admin/delivery/orders/${encodeURIComponent(orderId)}/dispatch`),

  assignPartner: (id: string, body: AssignDeliveryTaskBody): Promise<DeliveryTaskResponse> =>
    http.post<DeliveryTaskResponse>(`/api/v1/admin/delivery/tasks/${encodeURIComponent(id)}/assign`, body),

  pickup: (id: string): Promise<DeliveryTaskResponse> =>
    http.patch<DeliveryTaskResponse>(`/api/v1/delivery/tasks/${encodeURIComponent(id)}/pickup`),

  verifyOtpAndDeliver: (id: string, body: VerifyDeliveryOtpBody): Promise<DeliveryTaskResponse> =>
    http.post<DeliveryTaskResponse>(`/api/v1/delivery/tasks/${encodeURIComponent(id)}/deliver`, body),
};
