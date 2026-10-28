import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '#common/dto';
import { ToInt } from '#common/transformers';

export class QueryReviewsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter reviews by star rating (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
