import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { LIMITS, REGEX } from '#common/constants';
import { Trim } from '#common/transformers';
import { PaginationQueryDto } from './pagination-query.dto.js';

export class SortQueryDto {
  @ApiPropertyOptional({
    description: 'Comma-separated fields, prefix with - for descending',
    example: '-createdAt,name',
  })
  @IsOptional()
  @Matches(REGEX.SORT, { message: 'sort must look like "-createdAt,name"' })
  sort?: string;
}

export class SearchQueryDto {
  @ApiPropertyOptional({
    description: 'Free-text search',
    maxLength: LIMITS.SEARCH_QUERY_MAX_LENGTH,
  })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(LIMITS.SEARCH_QUERY_MAX_LENGTH)
  q?: string;
}

/** Base query DTO for every list endpoint. Extend it to add filters. */
export class ListQueryDto extends IntersectionType(
  PaginationQueryDto,
  SortQueryDto,
  SearchQueryDto,
) {}
