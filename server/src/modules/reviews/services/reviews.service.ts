import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode, ForbiddenAppException, NotFoundAppException } from '#common/exceptions';
import { OrderStatus } from '#common/enums';
import type { PaginatedResult } from '#common/dto';
import { OrderRepository } from '#modules/orders';
import { ShopRepository } from '#modules/shops';
import { UserRepository } from '#modules/users';
import { ReviewRepository } from '../repositories/review.repository.js';
import type { CreateReviewDto } from '../dto/create-review.dto.js';
import type { QueryReviewsDto } from '../dto/query-reviews.dto.js';
import type { ReviewResponseDto, ShopRatingSummaryDto } from '../dto/review-response.dto.js';
import { toReviewResponseDto } from '../mappers/review.mapper.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly orderRepo: OrderRepository,
    private readonly shopRepo: ShopRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createReview(
    customerId: string,
    orderId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new NotFoundAppException('Order', orderId);
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenAppException('You can only review your own orders');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppException(ErrorCode.REVIEW_ORDER_NOT_DELIVERED, {
        message: 'Only delivered orders can be reviewed',
      });
    }

    const existing = await this.reviewRepo.findByOrderId(orderId);
    if (existing) {
      throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS, {
        message: 'A review has already been submitted for this order',
      });
    }

    const customer = await this.userRepo.findById(customerId);
    const customerName = customer?.name?.trim() || 'Verified Customer';

    const review = await this.reviewRepo.create({
      shopId: order.shopId,
      orderId: order._id,
      customerId,
      customerName,
      rating: dto.rating,
      comment: dto.comment?.trim() || undefined,
      isVerifiedPurchase: true,
      isApproved: true,
      deletedAt: null,
      deletedBy: null,
    });

    // Recalculate and update shop rating average and count
    const stats = await this.reviewRepo.calculateShopRating(order.shopId);
    await this.shopRepo.updateById(order.shopId, {
      ratingAverage: stats.averageRating,
      ratingCount: stats.totalReviews,
    });

    return toReviewResponseDto(review);
  }

  async listForShop(
    shopId: string,
    query: QueryReviewsDto,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const filter: Record<string, unknown> = {
      shopId,
      isApproved: true,
    };

    if (query.rating) {
      filter.rating = query.rating;
    }

    const paginated = await this.reviewRepo.paginate(filter, query, {
      sortable: ['createdAt', 'rating'],
      defaultSort: '-createdAt',
    });

    return paginated.map(toReviewResponseDto);
  }

  async getShopRatingSummary(shopId: string): Promise<ShopRatingSummaryDto> {
    const stats = await this.reviewRepo.calculateShopRating(shopId);
    return {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      distribution: stats.distribution,
    };
  }

  async getByOrderId(orderId: string): Promise<ReviewResponseDto | null> {
    const review = await this.reviewRepo.findByOrderId(orderId);
    return review ? toReviewResponseDto(review) : null;
  }
}
