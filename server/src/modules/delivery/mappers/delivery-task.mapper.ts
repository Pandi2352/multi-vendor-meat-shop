import type { DeliveryTask } from '../schemas/delivery-task.schema.js';
import type { DeliveryTaskResponseDto } from '../dto/delivery-task-response.dto.js';

export const toDeliveryTaskResponseDto = (
  task: DeliveryTask,
  includeOtp = false,
): DeliveryTaskResponseDto => {
  return {
    id: task._id,
    orderId: task.orderId,
    orderNumber: task.orderNumber,
    shopId: task.shopId,
    shopName: task.shopName,
    customerId: task.customerId,
    partnerId: task.partnerId,
    partnerName: task.partnerName,
    partnerPhone: task.partnerPhone,
    status: task.status,
    pickupAddress: {
      text: task.pickupAddress.text,
      pincode: task.pickupAddress.pincode,
      district: task.pickupAddress.district,
      label: task.pickupAddress.label,
    },
    deliveryAddress: {
      text: task.deliveryAddress.text,
      pincode: task.deliveryAddress.pincode,
      district: task.deliveryAddress.district,
      label: task.deliveryAddress.label,
    },
    codAmountPaise: task.codAmountPaise,
    codCollected: task.codCollected,
    otpPlain: includeOtp ? task.otpPlain : undefined,
    assignedAt: task.assignedAt?.toISOString(),
    pickedUpAt: task.pickedUpAt?.toISOString(),
    deliveredAt: task.deliveredAt?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
};
