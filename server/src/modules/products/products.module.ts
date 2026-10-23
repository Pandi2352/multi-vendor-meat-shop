import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesModule } from '#modules/categories';
import { Product, ProductSchema } from './schemas/product.schema.js';
import { ProductRepository } from './repositories/product.repository.js';
import { ProductsService } from './services/products.service.js';
import { ProductsController } from './controllers/products.controller.js';
import { VendorProductsController } from './controllers/vendor-products.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CategoriesModule,
  ],
  controllers: [ProductsController, VendorProductsController],
  providers: [ProductRepository, ProductsService],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
