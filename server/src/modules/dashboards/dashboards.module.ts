import { Module } from '@nestjs/common';
import { DeliveryModule } from '#modules/delivery';
import { DisputesModule } from '#modules/disputes';
import { FinanceModule } from '#modules/finance';
import { InventoryModule } from '#modules/inventory';
import { OrdersModule } from '#modules/orders';
import { ProductsModule } from '#modules/products';
import { ShopsModule } from '#modules/shops';
import { VendorsModule } from '#modules/vendors';
import { AdminDashboardController } from './controllers/admin-dashboard.controller.js';
import { VendorDashboardController } from './controllers/vendor-dashboard.controller.js';
import { AdminDashboardService } from './services/admin-dashboard.service.js';
import { VendorDashboardService } from './services/vendor-dashboard.service.js';

/** Read-only summaries for the portal home pages. Owns no collections. */
@Module({
  imports: [
    VendorsModule,
    OrdersModule,
    ProductsModule,
    InventoryModule,
    FinanceModule,
    ShopsModule,
    DeliveryModule,
    DisputesModule,
  ],
  controllers: [VendorDashboardController, AdminDashboardController],
  providers: [VendorDashboardService, AdminDashboardService],
})
export class DashboardsModule {}
