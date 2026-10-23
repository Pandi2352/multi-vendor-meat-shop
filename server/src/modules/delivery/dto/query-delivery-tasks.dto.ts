import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '#common/dto';
import { DeliveryStatus } from '#common/enums';

export class QueryDeliveryTasksDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DeliveryStatus })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @ApiPropertyOptional({ example: '018f1234-abcd-7000-8000-000000000005' })
  @IsOptional()
  @IsUUID('7')
  partnerId?: string;

  @ApiPropertyOptional({ example: '018f1234-abcd-7000-8000-000000000003' })
  @IsOptional()
  @IsUUID('7')
  shopId?: string;

  @ApiPropertyOptional({ example: '2026-10-23' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
