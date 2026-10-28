import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { DeliveryStatus } from '#common/enums';
import type { ListQueryDto, PaginatedResult } from '#common/dto';
import { DeliveryTask } from '../schemas/delivery-task.schema.js';

export interface DeliveryTasksFilter {
  status?: DeliveryStatus;
  partnerId?: string;
  shopId?: string;
  date?: string;
}

@Injectable()
export class DeliveryTaskRepository extends BaseRepository<DeliveryTask> {
  constructor(@InjectModel(DeliveryTask.name) model: Model<DeliveryTask>) {
    super(model, 'DeliveryTask');
  }

  async findByOrderId(orderId: string): Promise<DeliveryTask | null> {
    return this.findOne({ orderId });
  }

  async findTasks(
    query: ListQueryDto,
    filters: DeliveryTasksFilter = {},
  ): Promise<PaginatedResult<DeliveryTask>> {
    const filter: Record<string, unknown> = {};

    if (filters.status) filter.status = filters.status;
    if (filters.partnerId) filter.partnerId = filters.partnerId;
    if (filters.shopId) filter.shopId = filters.shopId;

    if (filters.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.paginate(filter, query, {
      sortable: ['createdAt', 'status'],
      searchable: ['orderNumber'],
      defaultSort: '-createdAt',
    });
  }

  async findPartnerDeliveredTasks(partnerId: string): Promise<DeliveryTask[]> {
    return this.findMany(
      { partnerId, status: DeliveryStatus.DELIVERED },
      { sort: { deliveredAt: -1, createdAt: -1 } as never },
    );
  }
}
