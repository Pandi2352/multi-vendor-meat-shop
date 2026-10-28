import { ApiProperty } from '@nestjs/swagger';

export class ResendDeliveryOtpResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'cu***@gmail.com' })
  maskedEmail!: string;

  @ApiProperty({ example: 'Delivery OTP has been sent to your Gmail inbox via SMTP.' })
  message!: string;
}
