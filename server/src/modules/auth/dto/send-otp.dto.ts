import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { ToLowerCase, Trim } from '#common/transformers';

/** The client never chooses a role: storefront sign-ups are customers, portal users are invited. */
export class SendOtpDto {
  @ApiProperty({ example: 'customer@example.com' })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;
}
