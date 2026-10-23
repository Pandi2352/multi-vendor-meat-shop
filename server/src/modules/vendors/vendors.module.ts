import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, UserRepository } from '#modules/users';
import { VendorProfile, VendorProfileSchema } from './schemas/vendor-profile.schema.js';
import { VendorProfileRepository } from './repositories/vendor-profile.repository.js';
import { VendorProfileService } from './services/vendor-profile.service.js';
import { VendorProfileController } from './controllers/vendor-profile.controller.js';
import { AdminVendorsController } from './controllers/admin-vendors.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VendorProfile.name, schema: VendorProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [VendorProfileController, AdminVendorsController],
  providers: [VendorProfileRepository, UserRepository, VendorProfileService],
  exports: [VendorProfileService],
})
export class VendorsModule {}
