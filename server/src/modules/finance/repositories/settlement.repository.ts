import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Settlement } from '../schemas/settlement.schema.js';

@Injectable()
export class SettlementRepository extends BaseRepository<Settlement> {
  constructor(@InjectModel(Settlement.name) model: Model<Settlement>) {
    super(model, 'Settlement');
  }

  findByShop(shopId: string, limit = 20): Promise<Settlement[]> {
    return this.findMany({ shopId }, { sort: { createdAt: -1 }, limit });
  }

  findBySettlementNumber(settlementNumber: string): Promise<Settlement | null> {
    return this.findOne({ settlementNumber });
  }
}
