import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Commission } from '../schemas/commission.schema.js';

@Injectable()
export class CommissionRepository extends BaseRepository<Commission> {
  constructor(@InjectModel(Commission.name) model: Model<Commission>) {
    super(model, 'Commission');
  }

  findByOrderId(orderId: string): Promise<Commission | null> {
    return this.findOne({ orderId });
  }

  findPendingByShop(shopId: string): Promise<Commission[]> {
    return this.findMany({ shopId, status: 'PENDING' });
  }
}
