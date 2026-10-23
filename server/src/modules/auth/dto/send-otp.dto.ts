import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from '#common/enums';
import { ToLowerCase, Trim } from '#common/transformers';

export class SendOtpDto {
  @ApiProperty({ example: 'customer@example.com' })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CUSTOMER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
