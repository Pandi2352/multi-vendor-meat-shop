import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '#modules/products';
import { InventoryBatch, InventoryBatchSchema } from './schemas/inventory-batch.schema.js';
import { InventoryMovement, InventoryMovementSchema } from './schemas/inventory-movement.schema.js';
import { InventoryBatchRepository } from './repositories/inventory-batch.repository.js';
import { InventoryMovementRepository } from './repositories/inventory-movement.repository.js';
import { InventoryService } from './services/inventory.service.js';
import { VendorInventoryController } from './controllers/vendor-inventory.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryBatch.name, schema: InventoryBatchSchema },
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    ProductsModule,
  ],
  controllers: [VendorInventoryController],
  providers: [InventoryBatchRepository, InventoryMovementRepository, InventoryService],
  exports: [InventoryService, InventoryBatchRepository, InventoryMovementRepository],
})
export class InventoryModule {}
