import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from '#modules/orders';
import { ShopsModule } from '#modules/shops';
import { UsersModule } from '#modules/users';
import { Review, ReviewSchema } from './schemas/review.schema.js';
import { ReviewRepository } from './repositories/review.repository.js';
import { ReviewsService } from './services/reviews.service.js';
import { ReviewsController } from './controllers/reviews.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    OrdersModule,
    ShopsModule,
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewRepository, ReviewsService],
  exports: [ReviewsService, ReviewRepository],
})
export class ReviewsModule {}
