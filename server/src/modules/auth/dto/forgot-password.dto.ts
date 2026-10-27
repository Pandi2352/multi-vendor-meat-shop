import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { ToLowerCase, Trim } from '#common/transformers';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'muthu@yourshop.in', description: 'Portal account email' })
  @Trim()
  @ToLowerCase()
  @IsEmail()
  email!: string;
}
