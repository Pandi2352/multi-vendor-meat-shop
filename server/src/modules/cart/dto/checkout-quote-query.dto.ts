import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsOptional } from 'class-validator';
import { ToNumber } from '#common/transformers';

export class CheckoutQuoteQueryDto {
  @ApiPropertyOptional({ example: 13.0827, description: 'Customer delivery latitude' })
  @IsOptional()
  @ToNumber()
  @IsLatitude()
  lat?: number;

  @ApiPropertyOptional({ example: 80.2707, description: 'Customer delivery longitude' })
  @IsOptional()
  @ToNumber()
  @IsLongitude()
  lng?: number;

  @ApiPropertyOptional({ example: 'FIRSTMEAT50', description: 'Promotional discount coupon code' })
  @IsOptional()
  couponCode?: string;
}
