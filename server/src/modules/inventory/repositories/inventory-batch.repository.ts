import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { InventoryBatch } from '../schemas/inventory-batch.schema.js';

@Injectable()
export class InventoryBatchRepository extends BaseRepository<InventoryBatch> {
  constructor(@InjectModel(InventoryBatch.name) model: Model<InventoryBatch>) {
    super(model, 'InventoryBatch');
  }

  async findByShopProductDate(
    shopId: string,
    productId: string,
    batchDate: string,
  ): Promise<InventoryBatch | null> {
    return this.findOne({ shopId, productId, batchDate });
  }

  async findBatchesForDate(shopId: string, batchDate: string): Promise<InventoryBatch[]> {
    return this.findMany({ shopId, batchDate });
  }

  /**
   * Atomically decrements availableGrams and increments reservedGrams.
   * Returns null if availableGrams < grams (out of stock).
   */
  async atomicReserve(
    shopId: string,
    productId: string,
    batchDate: string,
    grams: number,
  ): Promise<InventoryBatch | null> {
    return this.model
      .findOneAndUpdate(
        {
          shopId,
          productId,
          batchDate,
          availableGrams: { $gte: grams },
        },
        {
          $inc: { availableGrams: -grams, reservedGrams: grams },
        },
        { new: true },
      )
      .lean<InventoryBatch>()
      .exec();
  }

  /**
   * Atomically returns reservedGrams back to availableGrams upon cancellation/timeout.
   */
  async atomicRelease(
    shopId: string,
    productId: string,
    batchDate: string,
    grams: number,
  ): Promise<InventoryBatch | null> {
    return this.model
      .findOneAndUpdate(
        {
          shopId,
          productId,
          batchDate,
          reservedGrams: { $gte: grams },
        },
        {
          $inc: { availableGrams: grams, reservedGrams: -grams },
        },
        { new: true },
      )
      .lean<InventoryBatch>()
      .exec();
  }

  /**
   * Atomically commits a sale by consuming reservedGrams.
   */
  async atomicCommit(
    shopId: string,
    productId: string,
    batchDate: string,
    grams: number,
  ): Promise<InventoryBatch | null> {
    // First try consuming from reservedGrams if a hold was placed (e.g. online payment)
    const fromReserved = await this.model
      .findOneAndUpdate(
        {
          shopId,
          productId,
          batchDate,
          reservedGrams: { $gte: grams },
        },
        {
          $inc: { reservedGrams: -grams },
        },
        { returnDocument: 'after' },
      )
      .lean<InventoryBatch>()
      .exec();

    if (fromReserved) return fromReserved;

    // Otherwise consume directly from availableGrams (e.g. Cash On Delivery)
    return this.model
      .findOneAndUpdate(
        {
          shopId,
          productId,
          batchDate,
          availableGrams: { $gte: grams },
        },
        {
          $inc: { availableGrams: -grams },
        },
        { returnDocument: 'after' },
      )
      .lean<InventoryBatch>()
      .exec();
  }

  /**
   * Atomically adjusts available stock (e.g. wastage or additional restock).
   */
  async atomicAdjustAvailable(
    shopId: string,
    productId: string,
    batchDate: string,
    deltaGrams: number,
  ): Promise<InventoryBatch | null> {
    const condition =
      deltaGrams < 0
        ? { shopId, productId, batchDate, availableGrams: { $gte: Math.abs(deltaGrams) } }
        : { shopId, productId, batchDate };

    return this.model
      .findOneAndUpdate(condition, { $inc: { availableGrams: deltaGrams } }, { new: true })
      .lean<InventoryBatch>()
      .exec();
  }
}
