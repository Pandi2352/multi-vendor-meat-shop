import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Favourite } from '../schemas/favourite.schema.js';

@Injectable()
export class FavouriteRepository extends BaseRepository<Favourite> {
  constructor(@InjectModel(Favourite.name) model: Model<Favourite>) {
    super(model, 'Favourite');
  }

  async findByCustomerId(customerId: string): Promise<Favourite[]> {
    return this.findMany({ customerId });
  }

  async findByCustomerAndProduct(customerId: string, productId: string): Promise<Favourite | null> {
    return this.findOne({ customerId, productId });
  }

  async findCustomerProductIds(customerId: string): Promise<string[]> {
    const list = await this.model.find({ customerId }).select('productId').lean<{ productId: string }[]>().exec();
    return list.map((item) => item.productId);
  }

  async deleteByCustomerAndProduct(customerId: string, productId: string): Promise<boolean> {
    const result = await this.model.deleteOne({ customerId, productId }).exec();
    return (result.deletedCount ?? 0) > 0;
  }
}
