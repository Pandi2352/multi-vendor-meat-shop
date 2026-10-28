import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Review, type ReviewDocument } from '../schemas/review.schema.js';

export interface ShopRatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

@Injectable()
export class ReviewRepository extends BaseRepository<Review> {
  constructor(@InjectModel(Review.name) model: Model<Review>) {
    super(model, 'Review');
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    return this.findOne({ orderId });
  }

  async calculateShopRating(shopId: string): Promise<ShopRatingStats> {
    const stats = await this.model.aggregate([
      { $match: { shopId, isApproved: true, deletedAt: null } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
    ]);

    if (!stats || stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const first = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of (first.ratings as number[]) || []) {
      if (r >= 1 && r <= 5) {
        distribution[r as 1 | 2 | 3 | 4 | 5] = (distribution[r as 1 | 2 | 3 | 4 | 5] || 0) + 1;
      }
    }

    return {
      averageRating: Math.round(first.avgRating * 10) / 10,
      totalReviews: first.count,
      distribution,
    };
  }
}
