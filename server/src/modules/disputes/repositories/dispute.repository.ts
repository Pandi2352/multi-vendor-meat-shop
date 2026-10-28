import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Dispute } from '../schemas/dispute.schema.js';

@Injectable()
export class DisputeRepository extends BaseRepository<Dispute> {
  constructor(@InjectModel(Dispute.name) model: Model<Dispute>) {
    super(model, 'Dispute');
  }

  findByTicketNumber(ticketNumber: string): Promise<Dispute | null> {
    return this.findOne({ ticketNumber });
  }

  findByOrderId(orderId: string): Promise<Dispute[]> {
    return this.findMany({ orderId }, { sort: { createdAt: -1 } });
  }

  findByShop(shopId: string, limit = 50): Promise<Dispute[]> {
    return this.findMany({ shopId }, { sort: { createdAt: -1 }, limit });
  }

  findByCustomerId(customerId: string, limit = 50): Promise<Dispute[]> {
    return this.findMany({ customerId }, { sort: { createdAt: -1 }, limit });
  }
}
