import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Trim } from '#common/transformers';

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Changed my mind / plans changed' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 200)
  reason?: string;
}
