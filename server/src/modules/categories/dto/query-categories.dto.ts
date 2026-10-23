import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ToBoolean } from '#common/transformers';
import { ListQueryDto } from '#common/dto';

export class QueryCategoriesDto extends ListQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by parent category' })
  @IsOptional()
  @IsUUID('7')
  parentId?: string;

  @ApiPropertyOptional({ description: 'Filter only active categories' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
