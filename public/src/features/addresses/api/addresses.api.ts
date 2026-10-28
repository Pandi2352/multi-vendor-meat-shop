import { http } from '@/lib/http';

export interface SavedAddress {
  id: string;
  userId: string;
  label: 'HOME' | 'WORK' | 'OTHER';
  text: string;
  pincode: string;
  district: string;
  isDefault: boolean;
  location?: { lat: number; lng: number };
  createdAt: string;
}

export interface CreateAddressBody {
  label: 'HOME' | 'WORK' | 'OTHER';
  text: string;
  pincode: string;
  district: string;
  isDefault?: boolean;
  lat?: number;
  lng?: number;
}

export interface UpdateAddressBody extends Partial<CreateAddressBody> {}

export const addressesApi = {
  list: (): Promise<SavedAddress[]> =>
    http.get<SavedAddress[]>('/api/v1/users/me/addresses'),

  create: (body: CreateAddressBody): Promise<SavedAddress> =>
    http.post<SavedAddress>('/api/v1/users/me/addresses', body),

  update: (id: string, body: UpdateAddressBody): Promise<SavedAddress> =>
    http.patch<SavedAddress>(`/api/v1/users/me/addresses/${encodeURIComponent(id)}`, body),

  delete: (id: string): Promise<{ success: boolean }> =>
    http.delete<{ success: boolean }>(`/api/v1/users/me/addresses/${encodeURIComponent(id)}`),

  setDefault: (id: string): Promise<SavedAddress> =>
    http.patch<SavedAddress>(`/api/v1/users/me/addresses/${encodeURIComponent(id)}/default`),
};
