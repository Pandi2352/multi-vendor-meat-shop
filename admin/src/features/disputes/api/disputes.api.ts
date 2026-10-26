import { http } from '@/lib/api-client';

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

export interface Dispute {
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

export interface DisputeQueryParams {
  status?: DisputeStatus;
  reason?: DisputeReason;
  shopId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ResolveDisputePayload {
  status: DisputeStatus;
  resolutionNotes: string;
  refundAmountPaise?: number;
  debitStall?: boolean;
  debitStallPaise?: number;
}

export interface PaginatedDisputes {
  items: Dispute[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const disputesApi = {
  list: (params: DisputeQueryParams = {}): Promise<PaginatedDisputes> => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.reason) query.append('reason', params.reason);
    if (params.shopId) query.append('shopId', params.shopId);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    return http.get<PaginatedDisputes>(`/admin/disputes${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string): Promise<Dispute> =>
    http.get<Dispute>(`/admin/disputes/${encodeURIComponent(id)}`),

  resolve: (id: string, payload: ResolveDisputePayload): Promise<Dispute> =>
    http.post<Dispute>(`/admin/disputes/${encodeURIComponent(id)}/resolve`, payload),
};
