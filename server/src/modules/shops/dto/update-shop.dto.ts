import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ShopStatus } from '#common/enums';
import { CreateShopDto } from './create-shop.dto.js';

export class UpdateShopDto extends PartialType(CreateShopDto) {
  @ApiPropertyOptional({ enum: ShopStatus, example: ShopStatus.OPEN })
  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;
}
