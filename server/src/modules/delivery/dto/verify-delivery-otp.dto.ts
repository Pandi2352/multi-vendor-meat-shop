import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Matches } from 'class-validator';
import { Trim } from '#common/transformers';

export class VerifyDeliveryOtpDto {
  @ApiProperty({ example: '4821', description: '4-digit OTP provided by customer' })
  @Trim()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'OTP must be exactly 4 digits' })
  otp!: string;

  @ApiProperty({ example: true, description: 'Confirmation that Cash On Delivery was collected' })
  @IsBoolean()
  collectedCod!: boolean;
}
