import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { ProductStatus } from '#common/enums';
import { Product } from '../schemas/product.schema.js';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(@InjectModel(Product.name) model: Model<Product>) {
    super(model, 'Product');
  }

  async findByShopAndSlug(shopId: string, slug: string): Promise<Product | null> {
    return this.findOne({ shopId, slug: slug.toLowerCase().trim() });
  }

  async findActiveByShop(shopId: string, categoryId?: string): Promise<Product[]> {
    const filter: Record<string, unknown> = {
      shopId,
      status: ProductStatus.ACTIVE,
    };
    if (categoryId) filter.categoryId = categoryId;
    return this.findMany(filter, { sort: { createdAt: -1 } });
  }
}
