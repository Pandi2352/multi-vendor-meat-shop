import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ToLowerCase, Trim } from '#common/transformers';

export class PortalLoginDto {
  @ApiProperty({ example: 'admin@virudhunagar-meats.in', description: 'Admin or staff work email' })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Admin@12345', description: 'Account password' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
