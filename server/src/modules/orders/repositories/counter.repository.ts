import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Counter } from '../schemas/counter.schema.js';

@Injectable()
export class CounterRepository extends BaseRepository<Counter> {
  constructor(@InjectModel(Counter.name) model: Model<Counter>) {
    super(model, 'Counter');
  }

  async getNextSequence(name: string): Promise<number> {
    const doc = await this.model
      .findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    return doc.seq;
  }
}
