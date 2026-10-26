import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { Trim } from '#common/transformers';

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Secure invitation onboarding token' })
  @Trim()
  @IsString()
  token!: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'New account password' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @ApiPropertyOptional({ example: 'Murugesan Pandian', description: 'User full name' })
  @IsOptional()
  @Trim()
  @IsString()
  name?: string;
}
