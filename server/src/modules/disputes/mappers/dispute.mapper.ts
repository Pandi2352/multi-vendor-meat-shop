import { Dispute } from '../schemas/dispute.schema.js';
import { DisputeResponseDto } from '../dto/dispute-response.dto.js';

export function toDisputeResponseDto(dispute: Dispute): DisputeResponseDto {
  return {
    id: dispute._id,
    ticketNumber: dispute.ticketNumber,
    orderId: dispute.orderId,
    orderNumber: dispute.orderNumber,
    shopId: dispute.shopId,
    customerId: dispute.customerId,
    customerName: dispute.customerName,
    customerPhone: dispute.customerPhone,
    reason: dispute.reason,
    status: dispute.status,
    customerComments: dispute.customerComments,
    evidencePhotoUrls: dispute.evidencePhotoUrls || [],
    claimedAmountPaise: dispute.claimedAmountPaise,
    refundAmountPaise: dispute.refundAmountPaise,
    debitStallPaise: dispute.debitStallPaise,
    resolutionNotes: dispute.resolutionNotes,
    resolvedBy: dispute.resolvedBy,
    resolvedAt: dispute.resolvedAt,
    createdAt: dispute.createdAt,
    updatedAt: dispute.updatedAt,
  };
}
