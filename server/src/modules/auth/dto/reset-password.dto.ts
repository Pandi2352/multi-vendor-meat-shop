import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { LIMITS } from '#common/constants';
import { Trim } from '#common/transformers';
import { IsAccountPassword } from '#common/validators';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token from the reset email link' })
  @Trim()
  @IsString()
  token!: string;

  @ApiProperty({ description: 'New password', minLength: LIMITS.PASSWORD_MIN_LENGTH, maxLength: LIMITS.PASSWORD_MAX_LENGTH })
  @IsAccountPassword()
  password!: string;
}
