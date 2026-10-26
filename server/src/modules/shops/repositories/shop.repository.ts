import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Shop } from '../schemas/shop.schema.js';

export interface ShopWithDistance extends Shop {
  distanceMeters?: number;
}

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

  /**
   * Free, native MongoDB geospatial calculation using $geoNear aggregation.
   * Calculates spherical geodesic distance in meters from current coordinates without external APIs.
   */
  findNearby(lng: number, lat: number, radiusKm: number): Promise<ShopWithDistance[]> {
    return this.model
      .aggregate<ShopWithDistance>([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distanceMeters',
            maxDistance: radiusKm * 1000,
            spherical: true,
            query: { deletedAt: null },
          },
        },
      ])
      .exec();
  }
}
