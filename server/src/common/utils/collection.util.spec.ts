import { describe, expect, it } from 'vitest';
import {
  chunk,
  compact,
  groupBy,
  isPlainObject,
  keyBy,
  omit,
  pick,
  sumBy,
  uniqBy,
} from './collection.util.js';

const items = [
  { id: 'a', shop: 's1', qty: 2 },
  { id: 'b', shop: 's2', qty: 3 },
  { id: 'c', shop: 's1', qty: 5 },
];

describe('collection.util', () => {
  it('picks, omits and compacts', () => {
    const source = { a: 1, b: undefined, c: null };
    expect(pick(source, ['a'])).toEqual({ a: 1 });
    expect(omit(source, ['a'])).toEqual({ b: undefined, c: null });
    expect(compact(source)).toEqual({ a: 1, c: null });
    expect(compact(source, true)).toEqual({ a: 1 });
  });

  it('detects plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(null)).toBe(false);
  });

  it('chunks, groups, keys, dedupes and sums', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(groupBy(items, (i) => i.shop).s1).toHaveLength(2);
    expect(keyBy(items, (i) => i.id).b.qty).toBe(3);
    expect(uniqBy(items, (i) => i.shop).map((i) => i.id)).toEqual(['a', 'b']);
    expect(sumBy(items, (i) => i.qty)).toBe(10);
  });
});
