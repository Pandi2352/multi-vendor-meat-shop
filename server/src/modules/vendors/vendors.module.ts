import { Module } from '@nestjs/common';
import { UsersModule } from '#modules/users';
import { VendorStatusController } from './controllers/vendor-status.controller.js';
import { ApprovedVendorGuard } from './guards/approved-vendor.guard.js';
import { VendorAccessService } from './services/vendor-access.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, UserRepository } from '#modules/users';
import { Shop, ShopSchema } from '../shops/schemas/shop.schema.js';
import { ShopRepository } from '../shops/repositories/shop.repository.js';
import { VendorProfile, VendorProfileSchema } from './schemas/vendor-profile.schema.js';
import { VendorProfileRepository } from './repositories/vendor-profile.repository.js';
import { VendorProfileService } from './services/vendor-profile.service.js';
import { VendorProfileController } from './controllers/vendor-profile.controller.js';
import { AdminVendorsController } from './controllers/admin-vendors.controller.js';
import { PublicVendorsController } from './controllers/public-vendors.controller.js';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: VendorProfile.name, schema: VendorProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Shop.name, schema: ShopSchema },
    ]),
  ],
  controllers: [
    VendorProfileController,
    AdminVendorsController,
    PublicVendorsController,
    VendorStatusController,
  ],
  providers: [
    VendorProfileRepository,
    UserRepository,
    ShopRepository,
    VendorProfileService,
    VendorAccessService,
    ApprovedVendorGuard,
  ],
  exports: [
    VendorProfileService,
    VendorProfileRepository,
    VendorAccessService,
    ApprovedVendorGuard,
  ],
})
export class VendorsModule {}
