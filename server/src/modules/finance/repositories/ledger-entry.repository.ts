import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { LedgerEntry } from '../schemas/ledger-entry.schema.js';

@Injectable()
export class LedgerEntryRepository extends BaseRepository<LedgerEntry> {
  constructor(@InjectModel(LedgerEntry.name) model: Model<LedgerEntry>) {
    super(model, 'LedgerEntry');
  }

  async getLatestBalance(shopId: string): Promise<number> {
    const latest = await this.model
      .findOne({ shopId })
      .sort({ createdAt: -1, _id: -1 })
      .lean()
      .exec();
    return latest?.balanceAfterPaise ?? 0;
  }

  findRecentByShop(shopId: string, limit = 50): Promise<LedgerEntry[]> {
    return this.findMany({ shopId }, { sort: { createdAt: -1 }, limit });
  }
}
