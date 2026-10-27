import { OrderStatus, Role } from '#common/enums';
import { createStateMachine, type Transition } from '#common/utils';

export const ORDER_TRANSITIONS: readonly Transition<OrderStatus, Role>[] = [
  // Creation with online payment
  { from: OrderStatus.PENDING_PAYMENT, to: OrderStatus.PLACED, actors: [Role.CUSTOMER, Role.ADMIN] },
  { from: OrderStatus.PENDING_PAYMENT, to: OrderStatus.CANCELLED, actors: [Role.CUSTOMER, Role.ADMIN] },

  // Vendor actions or Customer cancellation on PLACED
  { from: OrderStatus.PLACED, to: OrderStatus.ACCEPTED, actors: [Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN] },
  { from: OrderStatus.PLACED, to: OrderStatus.REJECTED, actors: [Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN] },
  { from: OrderStatus.PLACED, to: OrderStatus.CANCELLED, actors: [Role.CUSTOMER, Role.ADMIN] },

  // Preparation queue
  { from: OrderStatus.ACCEPTED, to: OrderStatus.PREPARING, actors: [Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN] },
  { from: OrderStatus.ACCEPTED, to: OrderStatus.CANCELLED, actors: [Role.ADMIN] },

  // Ready for pickup / dispatch
  { from: OrderStatus.PREPARING, to: OrderStatus.READY, actors: [Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN] },

  // Delivery transit
  { from: OrderStatus.READY, to: OrderStatus.OUT_FOR_DELIVERY, actors: [Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.DELIVERY_PARTNER, Role.ADMIN] },

  // Completion
  { from: OrderStatus.OUT_FOR_DELIVERY, to: OrderStatus.DELIVERED, actors: [Role.DELIVERY_PARTNER, Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN] },

  // Rejection / Refund flow
  { from: OrderStatus.REJECTED, to: OrderStatus.REFUND_PENDING, actors: [Role.ADMIN] },
  { from: OrderStatus.REFUND_PENDING, to: OrderStatus.REFUNDED, actors: [Role.ADMIN, Role.FINANCE] },

  // Disputes
  { from: OrderStatus.DELIVERED, to: OrderStatus.DISPUTED, actors: [Role.CUSTOMER, Role.ADMIN] },
  { from: OrderStatus.DISPUTED, to: OrderStatus.RESOLVED, actors: [Role.ADMIN, Role.SUPPORT] },
] as const;

export const ORDER_STATUS_MACHINE = createStateMachine<OrderStatus, Role>('Order', ORDER_TRANSITIONS);

export const CANCELLABLE_STATUSES: readonly OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PLACED,
];

/** Orders the shop still has to act on (accept, cut, hand over, deliver). */
export const IN_PROGRESS_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
];

/** Orders that ended without being fulfilled. */
export const UNFULFILLED_ORDER_STATUSES: readonly OrderStatus[] = [OrderStatus.CANCELLED, OrderStatus.REJECTED];

/** Not counted as sales: never paid, or ended without being fulfilled. */
export const NON_SALE_ORDER_STATUSES: readonly OrderStatus[] = [OrderStatus.PENDING_PAYMENT, ...UNFULFILLED_ORDER_STATUSES];
