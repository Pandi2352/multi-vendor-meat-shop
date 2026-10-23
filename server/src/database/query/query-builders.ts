import { AppException, ErrorCode } from '#common/exceptions';

export type SortSpec = Record<string, 1 | -1>;

export const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `-createdAt,name` → `{ createdAt: -1, name: 1 }`. Only whitelisted fields are allowed,
 * so clients cannot sort on unindexed or private fields.
 */
export const buildSort = (
  sort: string | undefined,
  allowed: readonly string[],
  fallback = '-createdAt',
): SortSpec => {
  const spec: SortSpec = {};
  for (const token of (sort || fallback).split(',')) {
    const field = token.replace(/^-/, '');
    if (!allowed.includes(field) && field !== 'createdAt') {
      throw new AppException(ErrorCode.VALIDATION_FAILED, {
        message: `Cannot sort by '${field}'`,
        details: [
          { field: 'sort', messages: [`allowed: ${[...allowed, 'createdAt'].join(', ')}`] },
        ],
      });
    }
    spec[field] = token.startsWith('-') ? -1 : 1;
  }
  return spec;
};

/** Case-insensitive "contains" search across fields. Returns `{}` for an empty query. */
export const buildSearchFilter = (
  q: string | undefined,
  fields: readonly string[],
): Record<string, unknown> => {
  const term = q?.trim();
  if (!term || !fields.length) return {};
  const pattern = { $regex: escapeRegex(term), $options: 'i' };
  return { $or: fields.map((field) => ({ [field]: pattern })) };
};

/**
 * Copies only whitelisted, defined filter values from a query DTO. Arrays become `$in`.
 * `buildFilter({ status: 'ACTIVE', page: 2 }, ['status'])` → `{ status: 'ACTIVE' }`
 */
export const buildFilter = (query: object, allowed: readonly string[]): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (!allowed.includes(key) || value === undefined || value === null || value === '') continue;
    filter[key] = Array.isArray(value) ? { $in: value } : value;
  }
  return filter;
};
