import { describe, expect, it, vi } from 'vitest';
import { OrderStatus, Role } from '#common/enums';
import { ErrorCode } from '#common/exceptions';
import type { AuthUser } from '#common/interfaces';
import type { FinanceService, SettlementRepository } from '#modules/finance';
import type { InventoryBatchRepository } from '#modules/inventory';
import type { OrderRepository } from '#modules/orders';
import type { ProductRepository } from '#modules/products';
import type { VendorAccessService } from '#modules/vendors';
import { VendorDashboardService } from './vendor-dashboard.service.js';

const order = {
  _id: 'order-1',
  orderNumber: 'VNR-1',
  status: OrderStatus.PLACED,
  totals: { totalPaise: 64_000, totalWeightGrams: 1_500 },
  items: [{}, {}],
  createdAt: new Date('2026-10-27T03:00:00Z'),
};

const setup = () => {
  const orders = {
    countByField: vi
      .fn()
      .mockResolvedValueOnce({ PLACED: 2, ACCEPTED: 1, PREPARING: 3, READY: 1, OUT_FOR_DELIVERY: 1 })
      .mockResolvedValueOnce({ DELIVERED: 7, CANCELLED: 1, REJECTED: 1 }),
    count: vi.fn().mockResolvedValue(12),
    sumField: vi.fn().mockResolvedValue(845_000),
    findMany: vi.fn().mockResolvedValue([order]),
  };
  const finance = {
    getFinanceSummary: vi.fn().mockResolvedValue({ payableBalancePaise: 85_000, pendingSettlementPaise: 40_500, totalSettledPayoutPaise: 364_500 }),
  };
  const settlements = { findByShop: vi.fn().mockResolvedValue([]) };
  const service = new VendorDashboardService(
    { getStatus: vi.fn().mockResolvedValue({ status: 'APPROVED', canSell: true }) } as unknown as VendorAccessService,
    orders as unknown as OrderRepository,
    { findMany: vi.fn().mockResolvedValue([{ _id: 'curry', name: 'Curry cut' }]) } as unknown as ProductRepository,
    { findBatchesForDate: vi.fn().mockResolvedValue([]) } as unknown as InventoryBatchRepository,
    finance as unknown as FinanceService,
    settlements as unknown as SettlementRepository,
  );
  return { service, orders, finance };
};

const owner: AuthUser = { id: 'u1', role: Role.VENDOR_OWNER, permissions: [], shopId: 'shop-1' };

describe('VendorDashboardService', () => {
  it('groups order statuses into the queue stages and today numbers', async () => {
    const { service, orders } = setup();
    const dashboard = await service.get(owner);

    expect(dashboard.inProgress).toEqual({ newOrders: 2, preparing: 4, ready: 1, outForDelivery: 1 });
    expect(dashboard.today).toEqual({ orders: 12, delivered: 7, cancelled: 2, salesPaise: 845_000 });
    expect(dashboard.queue).toEqual([expect.objectContaining({ orderNumber: 'VNR-1', itemCount: 2, totalPaise: 64_000 })]);
    expect(dashboard.stock.notStocked).toBe(1);
    expect(dashboard.payouts).toMatchObject({ payableBalancePaise: 85_000, lastPayout: null });
    // Every query is scoped to the signed-in user's shop.
    const filters: unknown[] = [
      ...orders.countByField.mock.calls.map((call: unknown[]) => call[1]),
      ...orders.findMany.mock.calls.map((call: unknown[]) => call[0]),
    ];
    for (const filter of filters) expect(filter).toMatchObject({ shopId: 'shop-1' });
  });

  it('never shows money to shop staff', async () => {
    const { service, finance } = setup();
    const dashboard = await service.get({ ...owner, role: Role.VENDOR_STAFF });
    expect(dashboard.payouts).toBeNull();
    expect(finance.getFinanceSummary).not.toHaveBeenCalled();
  });

  it('refuses an account with no shop', async () => {
    const { service } = setup();
    await expect(service.get({ ...owner, shopId: undefined })).rejects.toMatchObject({ code: ErrorCode.VENDOR_NOT_APPROVED });
  });
});
