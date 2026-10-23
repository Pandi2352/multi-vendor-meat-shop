import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CutType, ProductStatus, SellMode } from '#common/enums';
import { ListQueryDto } from '#common/dto';

export class QueryProductsDto extends ListQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by shop' })
  @IsOptional()
  @IsUUID('7')
  shopId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by category' })
  @IsOptional()
  @IsUUID('7')
  categoryId?: string;

  @ApiPropertyOptional({ enum: CutType })
  @IsOptional()
  @IsEnum(CutType)
  cutType?: CutType;

  @ApiPropertyOptional({ enum: SellMode })
  @IsOptional()
  @IsEnum(SellMode)
  sellMode?: SellMode;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
