import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { LIMITS } from '#common/constants';
import { Trim } from '#common/transformers';
import { IsAccountPassword } from '#common/validators';

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Secure invitation onboarding token' })
  @Trim()
  @IsString()
  token!: string;

  @ApiProperty({ description: 'New account password', minLength: LIMITS.PASSWORD_MIN_LENGTH, maxLength: LIMITS.PASSWORD_MAX_LENGTH })
  @IsAccountPassword()
  password!: string;

  @ApiPropertyOptional({ example: 'Murugesan Pandian', description: 'User full name' })
  @IsOptional()
  @Trim()
  @IsString()
  name?: string;
}
