import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from '#modules/orders';
import { ShopsModule } from '#modules/shops';
import { FinanceModule } from '#modules/finance';
import { UsersModule } from '#modules/users';
import { DeliveryTask, DeliveryTaskSchema } from './schemas/delivery-task.schema.js';
import { DeliveryTaskRepository } from './repositories/delivery-task.repository.js';
import { DeliveryTasksService } from './services/delivery-tasks.service.js';
import { DeliveryNotificationService } from './services/delivery-notification.service.js';
import { DeliveryTasksController } from './controllers/delivery-tasks.controller.js';
import { AdminDeliveryController } from './controllers/admin-delivery.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryTask.name, schema: DeliveryTaskSchema },
    ]),
    OrdersModule,
    ShopsModule,
    FinanceModule,
    UsersModule,
  ],
  controllers: [DeliveryTasksController, AdminDeliveryController],
  providers: [DeliveryTaskRepository, DeliveryTasksService, DeliveryNotificationService],
  exports: [DeliveryTasksService, DeliveryTaskRepository, DeliveryNotificationService],
})
export class DeliveryModule {}
