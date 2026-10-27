import { describe, expect, it, vi } from 'vitest';
import { Role } from '#common/enums';
import type { DeliveryTaskRepository } from '#modules/delivery';
import type { DisputeRepository } from '#modules/disputes';
import type { CommissionRepository } from '#modules/finance';
import type { OrderRepository } from '#modules/orders';
import type { ShopRepository } from '#modules/shops';
import type { VendorProfileRepository } from '#modules/vendors';
import { AdminDashboardService } from './admin-dashboard.service.js';

const setup = () => {
  const orders = {
    count: vi.fn().mockResolvedValue(40),
    countByField: vi.fn().mockResolvedValue({ PLACED: 3, PREPARING: 5, OUT_FOR_DELIVERY: 2 }),
    sumField: vi.fn().mockResolvedValue(1_250_000),
  };
  const commissions = { sumField: vi.fn().mockResolvedValue(310_000) };
  const service = new AdminDashboardService(
    { countByField: vi.fn().mockResolvedValue({ SUBMITTED: 2, UNDER_REVIEW: 1, APPROVED: 9, SUSPENDED: 1, DRAFT: 4 }) } as unknown as VendorProfileRepository,
    { countByField: vi.fn().mockResolvedValue({ OPEN: 7, CLOSED: 2, PAUSED: 1 }) } as unknown as ShopRepository,
    orders as unknown as OrderRepository,
    { countByField: vi.fn().mockResolvedValue({ UNASSIGNED: 2, ASSIGNED: 1, PICKED_UP: 3 }) } as unknown as DeliveryTaskRepository,
    { count: vi.fn().mockResolvedValue(4) } as unknown as DisputeRepository,
    commissions as unknown as CommissionRepository,
  );
  return { service, commissions };
};

describe('AdminDashboardService', () => {
  it('summarises what is waiting on the team', async () => {
    const { service } = setup();
    const dashboard = await service.get(Role.OPERATIONS);

    expect(dashboard.vendors).toEqual({ awaitingReview: 3, resubmissionRequired: 0, approved: 9, suspended: 1 });
    expect(dashboard.shops).toEqual({ open: 7, total: 10 });
    expect(dashboard.orders).toEqual({ today: 40, inProgress: 10, awaitingAcceptance: 3 });
    expect(dashboard.delivery).toEqual({ unassigned: 2, inTransit: 4 });
    expect(dashboard.openDisputes).toBe(4);
  });

  it.each([Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE])('shows money to %s', async (role) => {
    const { service } = setup();
    expect((await service.get(role)).money).toEqual({ salesTodayPaise: 1_250_000, pendingPayoutsPaise: 310_000 });
  });

  it.each([Role.OPERATIONS, Role.SUPPORT])('hides money from %s', async (role) => {
    const { service, commissions } = setup();
    expect((await service.get(role)).money).toBeNull();
    expect(commissions.sumField).not.toHaveBeenCalled();
  });
});
