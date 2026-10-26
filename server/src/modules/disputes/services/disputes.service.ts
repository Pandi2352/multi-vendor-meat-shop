import { Injectable } from '@nestjs/common';
import type { QueryFilter } from 'mongoose';
import { AppException, ErrorCode } from '#common/exceptions';
import { DisputeStatus, OrderStatus } from '#common/enums';
import { PaginatedResult } from '#common/dto';
import { createReferenceNumber, ReferencePrefix } from '#common/utils';
import { OrderRepository } from '#modules/orders';
import { FinanceService } from '#modules/finance';
import { Dispute, DisputeDocument } from '../schemas/dispute.schema.js';
import { DisputeRepository } from '../repositories/dispute.repository.js';
import { CreateDisputeDto } from '../dto/create-dispute.dto.js';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto.js';
import { DisputeQueryDto } from '../dto/dispute-query.dto.js';
import { toDisputeResponseDto } from '../mappers/dispute.mapper.js';
import { DisputeResponseDto } from '../dto/dispute-response.dto.js';

@Injectable()
export class DisputesService {
  constructor(
    private readonly disputeRepo: DisputeRepository,
    private readonly orderRepo: OrderRepository,
    private readonly financeService: FinanceService,
  ) {}

  async list(query: DisputeQueryDto): Promise<PaginatedResult<DisputeResponseDto>> {
    const filter: QueryFilter<DisputeDocument> = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.reason) {
      filter.reason = query.reason;
    }
    if (query.shopId) {
      filter.shopId = query.shopId;
    }
    if (query.search?.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { ticketNumber: { $regex: q, $options: 'i' } },
        { orderNumber: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
        { customerPhone: { $regex: q, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const total = await this.disputeRepo.count(filter);
    const disputes = await this.disputeRepo.findMany(filter, {
      sort: { createdAt: -1 },
      limit,
      skip,
    });

    return PaginatedResult.of(disputes.map(toDisputeResponseDto), total, page, limit);
  }

  async getById(id: string) {
    const dispute = await this.disputeRepo.findByIdOrThrow(id);
    return toDisputeResponseDto(dispute);
  }

  async create(dto: CreateDisputeDto, customerId: string) {
    const order = await this.orderRepo.findByIdOrThrow(dto.orderId);

    const ticketNumber = createReferenceNumber(ReferencePrefix.TICKET);
    const dispute = await this.disputeRepo.create({
      ticketNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      shopId: order.shopId,
      customerId,
      customerName: order.deliveryAddress?.label || 'Customer',
      customerPhone: '',
      reason: dto.reason,
      status: DisputeStatus.OPEN,
      customerComments: dto.customerComments,
      evidencePhotoUrls: dto.evidencePhotoUrls || [],
      claimedAmountPaise: dto.claimedAmountPaise,
    });

    await this.orderRepo.updateById(order._id, { status: OrderStatus.DISPUTED });

    return toDisputeResponseDto(dispute);
  }

  async resolve(id: string, dto: ResolveDisputeDto, adminUserId: string) {
    const dispute = await this.disputeRepo.findByIdOrThrow(id);

    let refundAmountPaise = 0;
    if (dto.status === DisputeStatus.RESOLVED_REFUND_FULL) {
      refundAmountPaise = dto.refundAmountPaise ?? dispute.claimedAmountPaise;
    } else if (dto.status === DisputeStatus.RESOLVED_REFUND_PARTIAL) {
      refundAmountPaise = dto.refundAmountPaise ?? 0;
    }

    const shouldDebitStall = dto.debitStall !== false && refundAmountPaise > 0;
    const debitStallPaise = shouldDebitStall ? (dto.debitStallPaise ?? refundAmountPaise) : 0;

    if (shouldDebitStall && debitStallPaise > 0) {
      await this.financeService.recordDisputeRefundDebit({
        shopId: dispute.shopId,
        amountPaise: debitStallPaise,
        orderNumber: dispute.orderNumber,
        disputeNumber: dispute.ticketNumber,
        reason: `${dispute.reason}: ${dto.resolutionNotes}`,
      });
    }

    if (dto.status !== DisputeStatus.UNDER_REVIEW) {
      await this.orderRepo.updateById(dispute.orderId, {
        status: refundAmountPaise > 0 ? OrderStatus.REFUNDED : OrderStatus.RESOLVED,
      });
    }

    const updated = await this.disputeRepo.updateByIdOrThrow(id, {
      status: dto.status,
      resolutionNotes: dto.resolutionNotes,
      refundAmountPaise,
      debitStallPaise,
      resolvedBy: adminUserId,
      resolvedAt: dto.status === DisputeStatus.UNDER_REVIEW ? undefined : new Date(),
    });

    return toDisputeResponseDto(updated);
  }
}
