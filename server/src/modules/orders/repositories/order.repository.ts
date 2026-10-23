import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { OrderStatus } from '#common/enums';
import { ListQueryDto, PaginatedResult } from '#common/dto';
import { Order } from '../schemas/order.schema.js';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor(@InjectModel(Order.name) model: Model<Order>) {
    super(model, 'Order');
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.findOne({ orderNumber });
  }

  async findCustomerOrders(
    customerId: string,
    query: ListQueryDto,
    status?: OrderStatus,
  ): Promise<PaginatedResult<Order>> {
    const filter: Record<string, unknown> = { customerId };
    if (status) filter.status = status;

    return this.paginate(filter, query, {
      sortable: ['createdAt', 'totals.totalPaise', 'status'],
      searchable: ['orderNumber'],
      defaultSort: '-createdAt',
    });
  }

  async findShopOrders(
    shopId: string,
    query: ListQueryDto,
    status?: OrderStatus,
    date?: string,
  ): Promise<PaginatedResult<Order>> {
    const filter: Record<string, unknown> = { shopId };
    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.paginate(filter, query, {
      sortable: ['createdAt', 'totals.totalPaise', 'status'],
      searchable: ['orderNumber'],
      defaultSort: '-createdAt',
    });
  }

  async findAdminOrders(
    query: ListQueryDto,
    filters: { shopId?: string; customerId?: string; status?: OrderStatus; date?: string },
  ): Promise<PaginatedResult<Order>> {
    const filter: Record<string, unknown> = {};
    if (filters.shopId) filter.shopId = filters.shopId;
    if (filters.customerId) filter.customerId = filters.customerId;
    if (filters.status) filter.status = filters.status;
    if (filters.date) {
      const startOfDay = new Date(`${filters.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${filters.date}T23:59:59.999Z`);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.paginate(filter, query, {
      sortable: ['createdAt', 'totals.totalPaise', 'status'],
      searchable: ['orderNumber'],
      defaultSort: '-createdAt',
    });
  }
}
