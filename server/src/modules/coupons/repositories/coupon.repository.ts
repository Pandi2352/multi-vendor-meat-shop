import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Coupon } from '../schemas/coupon.schema.js';

@Injectable()
export class CouponRepository extends BaseRepository<Coupon> {
  constructor(@InjectModel(Coupon.name) model: Model<Coupon>) {
    super(model, 'Coupon');
  }

  findByCode(code: string): Promise<Coupon | null> {
    return this.findOne({ code: code.trim().toUpperCase() });
  }

  async findAvailable(shopId?: string): Promise<Coupon[]> {
    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    };

    if (shopId) {
      query.$or = [{ applicableShopIds: { $size: 0 } }, { applicableShopIds: shopId }];
    }

    return this.findMany(query, { sort: { minOrderPaise: 1 } });
  }

  async recordUsage(code: string, customerId: string): Promise<void> {
    await this.model
      .updateOne(
        { code: code.trim().toUpperCase() },
        {
          $inc: { usedCount: 1 },
          $push: { usedCustomerIds: customerId },
        },
      )
      .exec();
  }
}
