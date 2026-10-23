import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, UserRepository } from '#modules/users';
import { VendorProfile, VendorProfileSchema, VendorProfileRepository } from '#modules/vendors';
import { Shop, ShopSchema } from './schemas/shop.schema.js';
import { ShopRepository } from './repositories/shop.repository.js';
import { ShopsService } from './services/shops.service.js';
import { ShopsController } from './controllers/shops.controller.js';
import { VendorShopsController } from './controllers/vendor-shops.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: VendorProfile.name, schema: VendorProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ShopsController, VendorShopsController],
  providers: [ShopRepository, VendorProfileRepository, UserRepository, ShopsService],
  exports: [ShopsService, ShopRepository],
})
export class ShopsModule {}
