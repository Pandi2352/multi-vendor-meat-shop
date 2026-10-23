import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Shop } from '../schemas/shop.schema.js';

@Injectable()
export class ShopRepository extends BaseRepository<Shop> {
  constructor(@InjectModel(Shop.name) model: Model<Shop>) {
    super(model, 'Shop');
  }

  findBySlug(slug: string): Promise<Shop | null> {
    return this.findOne({ slug: slug.toLowerCase().trim() });
  }

  findByVendorId(vendorId: string): Promise<Shop | null> {
    return this.findOne({ vendorId });
  }

  findNearby(lng: number, lat: number, radiusKm: number): Promise<Shop[]> {
    return this.model
      .find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      })
      .lean<Shop[]>()
      .exec();
  }
}
