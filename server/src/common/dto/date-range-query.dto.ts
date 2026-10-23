import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';
import { IsAfter } from '#common/validators';

export class DateRangeQueryDto {
  @ApiPropertyOptional({ format: 'date-time', example: '2026-10-01T00:00:00+05:30' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ format: 'date-time', example: '2026-10-31T23:59:59+05:30' })
  @IsOptional()
  @IsISO8601()
  @IsAfter('from', true)
  to?: string;
}
