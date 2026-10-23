import { PAGINATION } from '#common/constants';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const clampLimit = (limit: number = PAGINATION.DEFAULT_LIMIT): number =>
  Math.min(Math.max(Math.trunc(limit), 1), PAGINATION.MAX_LIMIT);

export const getSkip = (page: number, limit: number): number => (Math.max(page, 1) - 1) * limit;

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};
