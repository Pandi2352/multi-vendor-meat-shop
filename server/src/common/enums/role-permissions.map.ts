import { Permission as P } from './permission.enum.js';
import { Role } from './role.enum.js';

export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly P[]>> = {
  [Role.SUPER_ADMIN]: Object.values(P),
  [Role.CUSTOMER]: [],
  // Owner: the whole shop. Staff: the day-to-day counter work only (orders and stock).
  [Role.VENDOR_OWNER]: [
    P.SHOP_MANAGE,
    P.STAFF_MANAGE,
    P.PRODUCT_MANAGE,
    P.INVENTORY_MANAGE,
    P.ORDER_READ,
    P.ORDER_FULFIL,
    P.PROMOTION_MANAGE,
    P.SETTLEMENT_READ,
    P.PAYOUT_REQUEST,
    P.ANALYTICS_READ,
  ],
  [Role.VENDOR_STAFF]: [P.INVENTORY_MANAGE, P.ORDER_READ, P.ORDER_FULFIL],
  [Role.DELIVERY_PARTNER]: [P.DELIVERY_TASK_MANAGE],
  [Role.ADMIN]: Object.values(P),
  [Role.OPERATIONS]: [
    P.USER_READ,
    P.VENDOR_READ,
    P.VENDOR_VERIFY,
    P.CATEGORY_MANAGE,
    P.PRODUCT_MODERATE,
    P.ORDER_READ,
    P.ORDER_MANAGE,
    P.DELIVERY_TASK_MANAGE,
    P.ANALYTICS_READ,
  ],
  [Role.SUPPORT]: [P.USER_READ, P.VENDOR_READ, P.ORDER_READ, P.TICKET_MANAGE, P.REFUND_APPROVE],
  [Role.FINANCE]: [
    P.ORDER_READ,
    P.REFUND_APPROVE,
    P.COMMISSION_MANAGE,
    P.SETTLEMENT_READ,
    P.SETTLEMENT_MANAGE,
    P.ANALYTICS_READ,
  ],
};
