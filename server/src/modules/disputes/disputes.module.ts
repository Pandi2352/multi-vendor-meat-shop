import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from '#modules/orders';
import { FinanceModule } from '#modules/finance';
import { UsersModule } from '#modules/users';
import { Dispute, DisputeSchema } from './schemas/dispute.schema.js';
import { DisputeRepository } from './repositories/dispute.repository.js';
import { DisputesService } from './services/disputes.service.js';
import { AdminDisputesController } from './controllers/admin-disputes.controller.js';
import { CustomerTicketsController } from './controllers/customer-tickets.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dispute.name, schema: DisputeSchema }]),
    OrdersModule,
    FinanceModule,
    UsersModule,
  ],
  controllers: [AdminDisputesController, CustomerTicketsController],
  providers: [DisputeRepository, DisputesService],
  exports: [DisputesService, DisputeRepository],
})
export class DisputesModule {}
