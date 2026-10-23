import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, Length } from 'class-validator';
import { OrderStatus } from '#common/enums';
import { Trim } from '#common/transformers';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.ACCEPTED })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'Customer requested quick preparation' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 200)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Map of productId to actual packed grams recorded by the shop',
    example: { '018f1234-abcd-7000-8000-000000000001': 520 },
    additionalProperties: { type: 'number' },
  })
  @IsOptional()
  @IsObject()
  actualPackedWeights?: Record<string, number>;
}
