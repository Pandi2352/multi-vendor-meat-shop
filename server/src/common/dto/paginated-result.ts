import { buildPaginationMeta, type PaginationMeta } from '#common/utils';

/**
 * Returned by repositories/services for list endpoints.
 * The response envelope turns it into `{ success, data: items, meta }`.
 */
export class PaginatedResult<T> {
  constructor(
    readonly items: T[],
    readonly meta: PaginationMeta,
  ) {}

  static of<T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> {
    return new PaginatedResult(items, buildPaginationMeta(total, page, limit));
  }

  map<R>(mapper: (item: T) => R): PaginatedResult<R> {
    return new PaginatedResult(this.items.map(mapper), this.meta);
  }
}
