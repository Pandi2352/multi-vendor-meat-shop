import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Cart } from '../schemas/cart.schema.js';

@Injectable()
export class CartRepository extends BaseRepository<Cart> {
  constructor(@InjectModel(Cart.name) model: Model<Cart>) {
    super(model, 'Cart');
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    return this.findOne({ customerId });
  }

  async clearCart(customerId: string): Promise<Cart | null> {
    return this.model
      .findOneAndUpdate(
        { customerId },
        { shopId: null, items: [] },
        { new: true, upsert: true },
      )
      .lean<Cart>()
      .exec();
  }
}
