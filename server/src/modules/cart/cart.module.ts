import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '#modules/products';
import { ShopsModule } from '#modules/shops';
import { InventoryModule } from '#modules/inventory';
import { Cart, CartSchema } from './schemas/cart.schema.js';
import { CartRepository } from './repositories/cart.repository.js';
import { CartService } from './services/cart.service.js';
import { CartController } from './controllers/cart.controller.js';
import { CheckoutController } from './controllers/checkout.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule,
    ShopsModule,
    InventoryModule,
  ],
  controllers: [CartController, CheckoutController],
  providers: [CartRepository, CartService],
  exports: [CartService, CartRepository],
})
export class CartModule {}
