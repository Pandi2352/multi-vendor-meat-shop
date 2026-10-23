import { describe, expect, it } from 'vitest';
import { buildPaginationMeta, clampLimit, getSkip } from './pagination.util.js';

describe('pagination.util', () => {
  it('clamps limit', () => {
    expect(clampLimit()).toBe(20);
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(500)).toBe(100);
  });

  it('computes skip', () => {
    expect(getSkip(1, 20)).toBe(0);
    expect(getSkip(3, 20)).toBe(40);
    expect(getSkip(0, 20)).toBe(0);
  });

  it('builds meta', () => {
    expect(buildPaginationMeta(45, 2, 20)).toEqual({
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
    expect(buildPaginationMeta(0, 1, 20)).toMatchObject({
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });
});
