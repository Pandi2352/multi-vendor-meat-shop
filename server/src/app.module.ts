import { Module } from '@nestjs/common';
import { AppConfigModule } from '#config';
import { DatabaseModule } from '#database';
import { LoggerModule } from '#infra/logger';
import { MailModule } from '#infra/mail';
import { AppThrottlerModule } from '#infra/throttler';
import { AuthModule } from '#modules/auth';
import { CartModule } from '#modules/cart';
import { CategoriesModule } from '#modules/categories';
import { HealthModule } from '#modules/health';
import { InventoryModule } from '#modules/inventory';
import { OrdersModule } from '#modules/orders';
import { ProductsModule } from '#modules/products';
import { ShopsModule } from '#modules/shops';
import { UsersModule } from '#modules/users';
import { VendorsModule } from '#modules/vendors';
import { DeliveryModule } from '#modules/delivery';
import { FinanceModule } from '#modules/finance';
import { DisputesModule } from '#modules/disputes';
import { DashboardsModule } from '#modules/dashboards';
import { ReviewsModule } from '#modules/reviews';
import { CouponsModule } from '#modules/coupons';
import { APP_PROVIDERS } from './app.providers.js';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    MailModule,
    DatabaseModule,
    AppThrottlerModule,
    HealthModule,
    UsersModule,
    AuthModule,
    VendorsModule,
    ShopsModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    DeliveryModule,
    FinanceModule,
    DisputesModule,
    DashboardsModule,
    ReviewsModule,
    CouponsModule,
  ],
  providers: APP_PROVIDERS,
})
export class AppModule {}
