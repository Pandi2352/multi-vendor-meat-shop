import { http } from '@/lib/http';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_REFUND_FULL'
  | 'RESOLVED_REFUND_PARTIAL'
  | 'RESOLVED_REJECTED';

export type DisputeReason =
  | 'QUALITY_FRESHNESS'
  | 'UNDERWEIGHT'
  | 'WRONG_CUT'
  | 'WRONG_ITEM'
  | 'CONTAMINATION'
  | 'DELIVERY_DELAY'
  | 'MISSING_ITEMS'
  | 'OTHER';

export interface SupportTicketResponse {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber: string;
  shopId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  reason: DisputeReason;
  status: DisputeStatus;
  customerComments: string;
  evidencePhotoUrls: string[];
  claimedAmountPaise: number;
  refundAmountPaise?: number;
  debitStallPaise?: number;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketBody {
  orderId: string;
  reason: DisputeReason;
  customerComments: string;
  claimedAmountPaise: number;
  evidencePhotoUrls?: string[];
}

export const ticketsApi = {
  list: (): Promise<SupportTicketResponse[]> =>
    http.get<SupportTicketResponse[]>('/api/v1/tickets'),

  detail: (id: string): Promise<SupportTicketResponse> =>
    http.get<SupportTicketResponse>(`/api/v1/tickets/${encodeURIComponent(id)}`),

  getForOrder: (orderId: string): Promise<SupportTicketResponse | null> =>
    http.get<SupportTicketResponse | null>(`/api/v1/tickets/order/${encodeURIComponent(orderId)}`),

  create: (body: CreateTicketBody): Promise<SupportTicketResponse> =>
    http.post<SupportTicketResponse>('/api/v1/tickets', body),
};
