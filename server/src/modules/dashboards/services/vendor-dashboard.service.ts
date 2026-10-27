import { Injectable } from '@nestjs/common';
import { OrderStatus, ProductStatus, Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AuthUser } from '#common/interfaces';
import { todayIST, todayRangeIST } from '#common/utils';
import { FinanceService, SettlementRepository } from '#modules/finance';
import { InventoryBatchRepository } from '#modules/inventory';
import {
  IN_PROGRESS_ORDER_STATUSES,
  NON_SALE_ORDER_STATUSES,
  OrderRepository,
  UNFULFILLED_ORDER_STATUSES,
} from '#modules/orders';
import { ProductRepository } from '#modules/products';
import { VendorAccessService } from '#modules/vendors';
import type { VendorDashboardResponseDto, VendorPayoutSummaryDto } from '../dto/vendor-dashboard-response.dto.js';
import { buildStockSummary, toOrderPreviewDto } from '../mappers/dashboard.mapper.js';

const QUEUE_PREVIEW_SIZE = 5;

/** The shop owner's / staff's home screen: what needs doing now, today's numbers, stock and payouts. */
@Injectable()
export class VendorDashboardService {
  constructor(
    private readonly access: VendorAccessService,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly batches: InventoryBatchRepository,
    private readonly finance: FinanceService,
    private readonly settlements: SettlementRepository,
  ) {}

  async get(user: AuthUser): Promise<VendorDashboardResponseDto> {
    const { shopId } = user;
    if (!shopId) {
      throw new AppException(ErrorCode.VENDOR_NOT_APPROVED, { message: 'Your account isn’t linked to a shop yet.' });
    }
    const date = todayIST();
    const today = todayRangeIST();
    const inProgress = { shopId, status: { $in: IN_PROGRESS_ORDER_STATUSES } };

    const [shop, open, placedToday, closedToday, salesPaise, queue, products, batches, payouts] = await Promise.all([
      this.access.getStatus(shopId),
      this.orders.countByField('status', inProgress),
      this.orders.count({ shopId, createdAt: today, status: { $ne: OrderStatus.PENDING_PAYMENT } }),
      this.orders.countByField('status', {
        shopId,
        updatedAt: today,
        status: { $in: [OrderStatus.DELIVERED, ...UNFULFILLED_ORDER_STATUSES] },
      }),
      this.orders.sumField('totals.totalPaise', { shopId, createdAt: today, status: { $nin: NON_SALE_ORDER_STATUSES } }),
      this.orders.findMany(inProgress, { sort: { createdAt: 1 }, limit: QUEUE_PREVIEW_SIZE }),
      this.products.findMany({ shopId, status: ProductStatus.ACTIVE }, { projection: { name: 1 } }),
      this.batches.findBatchesForDate(shopId, date),
      // Money is for the owner only (staff can't open Settlements either).
      user.role === Role.VENDOR_OWNER ? this.payouts(shopId) : Promise.resolve(null),
    ]);

    const n = (counts: Record<string, number>, ...statuses: OrderStatus[]) =>
      statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0);

    return {
      date,
      shop,
      inProgress: {
        newOrders: n(open, OrderStatus.PLACED),
        preparing: n(open, OrderStatus.ACCEPTED, OrderStatus.PREPARING),
        ready: n(open, OrderStatus.READY),
        outForDelivery: n(open, OrderStatus.OUT_FOR_DELIVERY),
      },
      today: {
        orders: placedToday,
        delivered: n(closedToday, OrderStatus.DELIVERED),
        cancelled: n(closedToday, ...UNFULFILLED_ORDER_STATUSES),
        salesPaise,
      },
      queue: queue.map(toOrderPreviewDto),
      stock: buildStockSummary(products, batches),
      payouts,
    };
  }

  private async payouts(shopId: string): Promise<VendorPayoutSummaryDto> {
    const [summary, [last]] = await Promise.all([
      this.finance.getFinanceSummary(shopId),
      this.settlements.findByShop(shopId, 1),
    ]);
    return {
      payableBalancePaise: summary.payableBalancePaise,
      pendingSettlementPaise: summary.pendingSettlementPaise,
      totalSettledPayoutPaise: summary.totalSettledPayoutPaise,
      lastPayout: last ? { netPayoutPaise: last.netPayoutPaise, status: last.status, createdAt: last.createdAt } : null,
    };
  }
}
