import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SwaggerTag } from '#common/constants';
import { ApiEnvelope, ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser, Public } from '#common/decorators';
import { Trim } from '#common/transformers';
import { CouponsService } from '../services/coupons.service.js';
import { CouponResponseDto } from '../dto/coupon-response.dto.js';
import { ApplyCouponResponseDto } from '../dto/apply-coupon.dto.js';

export class ValidateCouponDto {
  @ApiProperty({ example: 'FIRSTMEAT50' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 45000, description: 'Order subtotal in paise to check eligibility' })
  @IsNumber()
  @Min(1)
  subtotalPaise!: number;

  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @Trim()
  @IsString()
  shopId?: string;
}

@ApiTags(SwaggerTag.COUPONS)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get('available')
  @Public()
  @ApiOperation({ summary: 'List available promotional coupons and discount codes' })
  @ApiEnvelope(CouponResponseDto, { isArray: true })
  @ApiStandardResponses()
  listAvailable(@Query('shopId') shopId?: string) {
    return this.coupons.listAvailable(shopId);
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Auth()
  @ApiOperation({ summary: 'Validate coupon and calculate savings for current subtotal' })
  @ApiOkEnvelope(ApplyCouponResponseDto)
  @ApiStandardResponses()
  async applyCoupon(
    @CurrentUser('id') customerId: string,
    @Body() dto: ValidateCouponDto,
  ): Promise<ApplyCouponResponseDto> {
    const result = await this.coupons.validateAndCalculateDiscount(
      dto.code,
      dto.subtotalPaise,
      customerId,
      dto.shopId,
    );

    return {
      code: result.coupon.code,
      description: result.coupon.description,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      discountPaise: result.discountPaise,
      subtotalPaise: dto.subtotalPaise,
      newTotalPaise: Math.max(0, dto.subtotalPaise - result.discountPaise),
    };
  }
}
