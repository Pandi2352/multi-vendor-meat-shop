import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Address } from '../schemas/address.schema.js';

@Injectable()
export class AddressRepository extends BaseRepository<Address> {
  constructor(@InjectModel(Address.name) model: Model<Address>) {
    super(model, 'Address');
  }

  findByUserId(userId: string): Promise<Address[]> {
    return this.findMany({ userId }, { sort: { isDefault: -1, createdAt: -1 } });
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await this.model.deleteOne({ _id: id }).exec();
    return res.deletedCount > 0;
  }

  async clearDefaults(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isDefault: true }, { isDefault: false }).exec();
  }
}
