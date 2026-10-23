import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { InventoryMovement } from '../schemas/inventory-movement.schema.js';

@Injectable()
export class InventoryMovementRepository extends BaseRepository<InventoryMovement> {
  constructor(@InjectModel(InventoryMovement.name) model: Model<InventoryMovement>) {
    super(model, 'InventoryMovement');
  }

  async findProductMovements(
    shopId: string,
    productId: string,
    limit = 50,
  ): Promise<InventoryMovement[]> {
    return this.findMany(
      { shopId, productId },
      {
        sort: { createdAt: -1 },
        limit,
      },
    );
  }
}
