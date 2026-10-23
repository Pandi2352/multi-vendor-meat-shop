import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { OrderEvent } from '../schemas/order-event.schema.js';

@Injectable()
export class OrderEventRepository extends BaseRepository<OrderEvent> {
  constructor(@InjectModel(OrderEvent.name) model: Model<OrderEvent>) {
    super(model, 'OrderEvent');
  }

  async findByOrderId(orderId: string): Promise<OrderEvent[]> {
    return this.model
      .find({ orderId })
      .sort({ createdAt: 1 })
      .lean<OrderEvent[]>()
      .exec();
  }
}
