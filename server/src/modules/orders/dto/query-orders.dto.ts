import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '#common/enums';
import { ListQueryDto } from '#common/dto';

export class QueryCustomerOrdersDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class QueryVendorOrdersDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: '2026-10-23', description: 'Filter by date YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class QueryAdminOrdersDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by shop' })
  @IsOptional()
  @IsUUID('7')
  shopId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by customer' })
  @IsOptional()
  @IsUUID('7')
  customerId?: string;

  @ApiPropertyOptional({ example: '2026-10-23', description: 'Filter by date YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
