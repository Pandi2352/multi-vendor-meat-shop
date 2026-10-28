import { Order } from '../schemas/order.schema.js';
import { OrderEvent } from '../schemas/order-event.schema.js';
import {
  OrderEventResponseDto,
  OrderItemResponseDto,
  OrderResponseDto,
} from '../dto/order-response.dto.js';

export const toOrderEventResponseDto = (event: OrderEvent): OrderEventResponseDto => ({
  id: event._id,
  orderId: event.orderId,
  fromStatus: event.fromStatus,
  toStatus: event.toStatus,
  actorId: event.actorId,
  actorRole: event.actorRole,
  reason: event.reason,
  createdAt: event.createdAt.toISOString(),
});

export const toOrderResponseDto = (
  order: Order,
  events?: OrderEvent[],
  shopName?: string,
): OrderResponseDto => ({
  id: order._id,
  orderNumber: order.orderNumber,
  customerId: order.customerId,
  shopId: order.shopId,
  shopName,
  items: order.items.map(
    (item): OrderItemResponseDto => ({
      productId: item.productId,
      name: item.name,
      grams: item.grams,
      quantity: item.quantity,
      cutType: item.cutType,
      preparation: item.preparation,
      pricePerKgPaise: item.pricePerKgPaise,
      lineTotalPaise: item.lineTotalPaise,
      actualPackedGrams: item.actualPackedGrams,
      notes: item.notes,
    }),
  ),
  totals: {
    subtotalPaise: order.totals.subtotalPaise,
    deliveryFeePaise: order.totals.deliveryFeePaise,
    packagingFeePaise: order.totals.packagingFeePaise,
    discountPaise: order.totals.discountPaise,
    totalPaise: order.totals.totalPaise,
    totalWeightGrams: order.totals.totalWeightGrams,
  },
  deliveryAddress: {
    text: order.deliveryAddress.text,
    pincode: order.deliveryAddress.pincode,
    district: order.deliveryAddress.district,
    location: {
      lat: order.deliveryAddress.location.lat,
      lng: order.deliveryAddress.location.lng,
    },
    label: order.deliveryAddress.label,
  },
  customerNotes: order.customerNotes,
  status: order.status,
  payment: {
    method: order.payment.method,
    status: order.payment.status,
    providerRef: order.payment.providerRef,
    paidAt: order.payment.paidAt ? order.payment.paidAt.toISOString() : undefined,
  },
  slot: order.slot
    ? {
        date: order.slot.date,
        startTime: order.slot.startTime,
        endTime: order.slot.endTime,
      }
    : undefined,
  cancelReason: order.cancelReason,
  rejectReason: order.rejectReason,
  couponCode: order.couponCode,
  timeline: events ? events.map(toOrderEventResponseDto) : undefined,
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
});
