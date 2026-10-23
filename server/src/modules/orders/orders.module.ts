import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopsModule } from '#modules/shops';
import { ProductsModule } from '#modules/products';
import { InventoryModule } from '#modules/inventory';
import { CartModule } from '#modules/cart';
import { Order, OrderSchema } from './schemas/order.schema.js';
import { OrderEvent, OrderEventSchema } from './schemas/order-event.schema.js';
import { Counter, CounterSchema } from './schemas/counter.schema.js';
import { OrderRepository } from './repositories/order.repository.js';
import { OrderEventRepository } from './repositories/order-event.repository.js';
import { CounterRepository } from './repositories/counter.repository.js';
import { OrderNumberService } from './services/order-number.service.js';
import { OrdersService } from './services/orders.service.js';
import { OrderFulfilmentService } from './services/order-fulfilment.service.js';
import { OrdersController } from './controllers/orders.controller.js';
import { VendorOrdersController } from './controllers/vendor-orders.controller.js';
import { AdminOrdersController } from './controllers/admin-orders.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderEvent.name, schema: OrderEventSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    ShopsModule,
    ProductsModule,
    InventoryModule,
    CartModule,
  ],
  controllers: [OrdersController, VendorOrdersController, AdminOrdersController],
  providers: [
    OrderRepository,
    OrderEventRepository,
    CounterRepository,
    OrderNumberService,
    OrdersService,
    OrderFulfilmentService,
  ],
  exports: [OrdersService, OrderFulfilmentService, OrderRepository, OrderEventRepository],
})
export class OrdersModule {}
