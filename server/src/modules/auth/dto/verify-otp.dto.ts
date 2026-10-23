import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { ToLowerCase, Trim } from '#common/transformers';

export class VerifyOtpDto {
  @ApiProperty({ example: 'customer@example.com' })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @Trim()
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp!: string;
}
