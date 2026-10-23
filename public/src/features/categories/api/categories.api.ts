import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type Category = components['schemas']['CategoryResponseDto'];

export const categoriesApi = {
  listTree: (): Promise<Category[]> => http.get<Category[]>('/api/v1/categories'),
  getById: (id: string): Promise<Category> =>
    http.get<Category>(`/api/v1/categories/${encodeURIComponent(id)}`),
};
