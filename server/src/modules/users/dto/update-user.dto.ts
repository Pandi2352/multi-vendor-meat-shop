import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Trim } from '#common/transformers';
import { IsIndianPhone } from '#common/validators';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Arun Kumar' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 60)
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsIndianPhone()
  phone?: string;
}
