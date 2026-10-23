import { describe, expect, it } from 'vitest';
import { AppException } from '#common/exceptions';
import { buildFilter, buildSearchFilter, buildSort, escapeRegex } from './query-builders.js';

describe('query builders', () => {
  it('builds whitelisted sorts', () => {
    expect(buildSort('-pricePerKgPaise,name', ['name', 'pricePerKgPaise'])).toEqual({
      pricePerKgPaise: -1,
      name: 1,
    });
    expect(buildSort(undefined, [])).toEqual({ createdAt: -1 });
    expect(() => buildSort('passwordHash', ['name'])).toThrow(AppException);
  });

  it('escapes regex input', () => {
    expect(escapeRegex('a.b*(c)')).toBe('a\\.b\\*\\(c\\)');
  });

  it('builds search filters', () => {
    expect(buildSearchFilter('  curry ', ['name', 'slug'])).toEqual({
      $or: [
        { name: { $regex: 'curry', $options: 'i' } },
        { slug: { $regex: 'curry', $options: 'i' } },
      ],
    });
    expect(buildSearchFilter('', ['name'])).toEqual({});
  });

  it('builds whitelisted filters', () => {
    expect(
      buildFilter({ status: 'ACTIVE', shopId: undefined, page: 2, cuts: ['A', 'B'] }, [
        'status',
        'shopId',
        'cuts',
      ]),
    ).toEqual({
      status: 'ACTIVE',
      cuts: { $in: ['A', 'B'] },
    });
  });
});
