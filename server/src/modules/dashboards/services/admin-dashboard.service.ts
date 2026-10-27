import { Injectable } from '@nestjs/common';
import { DeliveryStatus, DisputeStatus, OrderStatus, Role, ShopStatus, VendorVerificationStatus } from '#common/enums';
import { effectiveRoles } from '#common/guards';
import { todayIST, todayRangeIST } from '#common/utils';
import { DeliveryTaskRepository } from '#modules/delivery';
import { DisputeRepository } from '#modules/disputes';
import { CommissionRepository } from '#modules/finance';
import { IN_PROGRESS_ORDER_STATUSES, NON_SALE_ORDER_STATUSES, OrderRepository } from '#modules/orders';
import { ShopRepository } from '#modules/shops';
import { VendorProfileRepository } from '#modules/vendors';
import type { AdminDashboardResponseDto, AdminMoneySummaryDto } from '../dto/admin-dashboard-response.dto.js';

/** Roles that see money on the admin dashboard (super admin is included through ADMIN). */
const MONEY_ROLES: readonly Role[] = [Role.ADMIN, Role.FINANCE];

const IN_TRANSIT: readonly DeliveryStatus[] = [
  DeliveryStatus.ASSIGNED,
  DeliveryStatus.ACCEPTED,
  DeliveryStatus.PICKED_UP,
  DeliveryStatus.OUT_FOR_DELIVERY,
];

const sum = (counts: Record<string, number>, ...keys: string[]) =>
  keys.reduce((acc, key) => acc + (counts[key] ?? 0), 0);
const total = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

/** Marketplace health for the operations team: what is waiting on someone right now. */
@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly vendorProfiles: VendorProfileRepository,
    private readonly shops: ShopRepository,
    private readonly orders: OrderRepository,
    private readonly deliveryTasks: DeliveryTaskRepository,
    private readonly disputes: DisputeRepository,
    private readonly commissions: CommissionRepository,
  ) {}

  async get(role: Role): Promise<AdminDashboardResponseDto> {
    const seesMoney = effectiveRoles(role).some((r) => MONEY_ROLES.includes(r));

    const [vendors, shops, ordersToday, inProgress, delivery, openDisputes, money] = await Promise.all([
      this.vendorProfiles.countByField('status'),
      this.shops.countByField('status'),
      this.orders.count({ createdAt: todayRangeIST(), status: { $ne: OrderStatus.PENDING_PAYMENT } }),
      this.orders.countByField('status', { status: { $in: IN_PROGRESS_ORDER_STATUSES } }),
      this.deliveryTasks.countByField('status', { status: { $in: [DeliveryStatus.UNASSIGNED, ...IN_TRANSIT] } }),
      this.disputes.count({ status: { $in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] } }),
      seesMoney ? this.money() : Promise.resolve(null),
    ]);

    return {
      date: todayIST(),
      vendors: {
        awaitingReview: sum(vendors, VendorVerificationStatus.SUBMITTED, VendorVerificationStatus.UNDER_REVIEW),
        resubmissionRequired: sum(vendors, VendorVerificationStatus.RESUBMISSION_REQUIRED),
        approved: sum(vendors, VendorVerificationStatus.APPROVED),
        suspended: sum(vendors, VendorVerificationStatus.SUSPENDED),
      },
      shops: { open: sum(shops, ShopStatus.OPEN), total: total(shops) },
      orders: {
        today: ordersToday,
        inProgress: total(inProgress),
        awaitingAcceptance: sum(inProgress, OrderStatus.PLACED),
      },
      delivery: { unassigned: sum(delivery, DeliveryStatus.UNASSIGNED), inTransit: sum(delivery, ...IN_TRANSIT) },
      openDisputes,
      money,
    };
  }

  private async money(): Promise<AdminMoneySummaryDto> {
    const [salesTodayPaise, pendingPayoutsPaise] = await Promise.all([
      this.orders.sumField('totals.totalPaise', {
        createdAt: todayRangeIST(),
        status: { $nin: NON_SALE_ORDER_STATUSES },
      }),
      this.commissions.sumField('netVendorAmountPaise', { status: 'PENDING' }),
    ]);
    return { salesTodayPaise, pendingPayoutsPaise };
  }
}
