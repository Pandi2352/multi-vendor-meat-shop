import { getBatchStatus } from '#modules/inventory';
import type { Order } from '#modules/orders';
import type {
  DashboardOrderPreviewDto,
  StockAlertDto,
  StockAlertLevel,
  VendorStockSummaryDto,
} from '../dto/vendor-dashboard-response.dto.js';

const MAX_STOCK_ALERTS = 6;
const ALERT_ORDER: Record<StockAlertLevel, number> = { OUT_OF_STOCK: 0, NOT_STOCKED: 1, LOW_STOCK: 2 };

export const toOrderPreviewDto = (order: Order): DashboardOrderPreviewDto => ({
  id: order._id,
  orderNumber: order.orderNumber,
  status: order.status,
  totalPaise: order.totals.totalPaise,
  totalWeightGrams: order.totals.totalWeightGrams,
  itemCount: order.items.length,
  createdAt: order.createdAt,
});

/**
 * Today's stock picture for a shop's active products. A product with no batch today is
 * "not stocked"; batches use the same low/out thresholds as the inventory page.
 */
export const buildStockSummary = (
  products: readonly { _id: string; name: string }[],
  batches: readonly { productId: string; availableGrams: number }[],
): VendorStockSummaryDto => {
  const gramsByProduct = new Map(batches.map((batch) => [batch.productId, batch.availableGrams]));
  const alerts: StockAlertDto[] = [];
  let stockedToday = 0;

  for (const product of products) {
    const grams = gramsByProduct.get(product._id);
    if (grams === undefined) {
      alerts.push({ productId: product._id, productName: product.name, availableGrams: 0, level: 'NOT_STOCKED' });
      continue;
    }
    stockedToday += 1;
    const status = getBatchStatus(grams);
    if (status === 'OUT_OF_STOCK' || status === 'LOW_STOCK') {
      alerts.push({ productId: product._id, productName: product.name, availableGrams: grams, level: status });
    }
  }

  const countOf = (level: StockAlertLevel) => alerts.filter((alert) => alert.level === level).length;
  alerts.sort((a, b) => ALERT_ORDER[a.level] - ALERT_ORDER[b.level] || a.availableGrams - b.availableGrams);

  return {
    activeProducts: products.length,
    stockedToday,
    lowStock: countOf('LOW_STOCK'),
    outOfStock: countOf('OUT_OF_STOCK'),
    notStocked: countOf('NOT_STOCKED'),
    alerts: alerts.slice(0, MAX_STOCK_ALERTS),
  };
};
