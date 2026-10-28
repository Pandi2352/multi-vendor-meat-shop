import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '#modules/products';
import { ShopsModule } from '#modules/shops';
import { InventoryModule } from '#modules/inventory';
import { Favourite, FavouriteSchema } from './schemas/favourite.schema.js';
import { FavouriteRepository } from './repositories/favourite.repository.js';
import { FavouritesService } from './services/favourites.service.js';
import { FavouritesController } from './controllers/favourites.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Favourite.name, schema: FavouriteSchema }]),
    ProductsModule,
    ShopsModule,
    InventoryModule,
  ],
  controllers: [FavouritesController],
  providers: [FavouriteRepository, FavouritesService],
  exports: [FavouritesService, FavouriteRepository],
})
export class FavouritesModule {}
