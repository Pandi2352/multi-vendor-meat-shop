import { describe, expect, it } from 'vitest';
import { buildStockSummary } from './dashboard.mapper.js';

const product = (id: string, name = id) => ({ _id: id, name });

describe('buildStockSummary', () => {
  it('splits active products into stocked, low, out and not stocked', () => {
    const summary = buildStockSummary(
      [product('curry'), product('liver'), product('chops'), product('keema'), product('legs')],
      [
        { productId: 'curry', availableGrams: 12_000 },
        { productId: 'liver', availableGrams: 1_500 },
        { productId: 'chops', availableGrams: 0 },
        { productId: 'retired', availableGrams: 900 }, // batch for a product no longer active
      ],
    );

    expect(summary).toMatchObject({ activeProducts: 5, stockedToday: 3, lowStock: 1, outOfStock: 1, notStocked: 2 });
    expect(summary.alerts.map((a) => [a.productId, a.level])).toEqual([
      ['chops', 'OUT_OF_STOCK'],
      ['keema', 'NOT_STOCKED'],
      ['legs', 'NOT_STOCKED'],
      ['liver', 'LOW_STOCK'],
    ]);
  });

  it('keeps at most six alerts but counts all of them', () => {
    const products = Array.from({ length: 9 }, (_, i) => product(`p${i}`));
    const summary = buildStockSummary(products, []);
    expect(summary.notStocked).toBe(9);
    expect(summary.alerts).toHaveLength(6);
  });

  it('has no alerts when everything is well stocked', () => {
    const summary = buildStockSummary([product('curry')], [{ productId: 'curry', availableGrams: 5_000 }]);
    expect(summary.alerts).toEqual([]);
    expect(summary.stockedToday).toBe(1);
  });
});
