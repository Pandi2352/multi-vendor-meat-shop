import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  Public,
  UuidParam,
} from '#common/decorators';
import { ReviewsService } from '../services/reviews.service.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { QueryReviewsDto } from '../dto/query-reviews.dto.js';
import { ReviewResponseDto, ShopRatingSummaryDto } from '../dto/review-response.dto.js';

@ApiTags(SwaggerTag.REVIEWS)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('orders/:orderId/review')
  @Auth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit verified customer star rating and review for delivered order' })
  @ApiCreatedEnvelope(ReviewResponseDto)
  @ApiStandardResponses()
  createReview(
    @CurrentUser('id') customerId: string,
    @UuidParam('orderId') orderId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.createReview(customerId, orderId, dto);
  }

  @Get('orders/:orderId/review')
  @Public()
  @ApiOperation({ summary: 'Get existing review submitted for an order' })
  @ApiOkEnvelope(ReviewResponseDto)
  @ApiStandardResponses()
  getOrderReview(@UuidParam('orderId') orderId: string): Promise<ReviewResponseDto | null> {
    return this.reviewsService.getByOrderId(orderId);
  }

  @Get('shops/:shopId/reviews')
  @Public()
  @ApiOperation({ summary: 'Get paginated customer reviews for a butcher stall' })
  @ApiPaginatedResponse(ReviewResponseDto)
  @ApiStandardResponses()
  listShopReviews(
    @UuidParam('shopId') shopId: string,
    @Query() query: QueryReviewsDto,
  ) {
    return this.reviewsService.listForShop(shopId, query);
  }

  @Get('shops/:shopId/reviews/summary')
  @Public()
  @ApiOperation({ summary: 'Get star ratings summary and distribution breakdown for a stall' })
  @ApiOkEnvelope(ShopRatingSummaryDto)
  @ApiStandardResponses()
  getShopRatingSummary(@UuidParam('shopId') shopId: string): Promise<ShopRatingSummaryDto> {
    return this.reviewsService.getShopRatingSummary(shopId);
  }
}
