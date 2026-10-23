import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PAGINATION } from '#common/constants';
import { ToInt } from '#common/transformers';

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: PAGINATION.DEFAULT_PAGE })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  page: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: PAGINATION.MAX_LIMIT,
    default: PAGINATION.DEFAULT_LIMIT,
  })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_LIMIT)
  limit: number = PAGINATION.DEFAULT_LIMIT;
}
