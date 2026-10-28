import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './schemas/coupon.schema.js';
import { CouponRepository } from './repositories/coupon.repository.js';
import { CouponsService } from './services/coupons.service.js';
import { CouponsController } from './controllers/coupons.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [CouponsController],
  providers: [CouponRepository, CouponsService],
  exports: [CouponsService, CouponRepository],
})
export class CouponsModule {}
