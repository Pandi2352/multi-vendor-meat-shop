import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { Trim } from '#common/transformers';

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT Refresh Token' })
  @Trim()
  @IsString()
  @MinLength(10)
  refreshToken!: string;
}
