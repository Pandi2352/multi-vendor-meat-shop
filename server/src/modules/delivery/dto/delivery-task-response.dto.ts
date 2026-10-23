import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '#common/enums';

export class DeliveryAddressResponseDto {
  @ApiProperty({ example: '12 Gandhi Road, T. Nagar, Chennai' })
  text!: string;

  @ApiProperty({ example: '600017' })
  pincode!: string;

  @ApiProperty({ example: 'Chennai' })
  district!: string;

  @ApiPropertyOptional({ example: 'Home' })
  label?: string;
}

export class DeliveryTaskResponseDto {
  @ApiProperty({ example: '018f1234-abcd-7000-8000-000000000001' })
  id!: string;

  @ApiProperty({ example: '018f1234-abcd-7000-8000-000000000002' })
  orderId!: string;

  @ApiProperty({ example: 'TN-20261023-0001' })
  orderNumber!: string;

  @ApiProperty({ example: '018f1234-abcd-7000-8000-000000000003' })
  shopId!: string;

  @ApiProperty({ example: 'Madurai Fresh Mutton Stall' })
  shopName!: string;

  @ApiProperty({ example: '018f1234-abcd-7000-8000-000000000004' })
  customerId!: string;

  @ApiPropertyOptional({ example: '018f1234-abcd-7000-8000-000000000005' })
  partnerId?: string;

  @ApiPropertyOptional({ example: 'Karthik Rider' })
  partnerName?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  partnerPhone?: string;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.UNASSIGNED })
  status!: DeliveryStatus;

  @ApiProperty({ type: DeliveryAddressResponseDto })
  pickupAddress!: DeliveryAddressResponseDto;

  @ApiProperty({ type: DeliveryAddressResponseDto })
  deliveryAddress!: DeliveryAddressResponseDto;

  @ApiProperty({ example: 42500, description: 'Cash on delivery amount in paise to collect' })
  codAmountPaise!: number;

  @ApiProperty({ example: false })
  codCollected!: boolean;

  @ApiPropertyOptional({ example: '4821', description: 'Customer OTP proof for handoff' })
  otpPlain?: string;

  @ApiPropertyOptional({ example: '2026-10-23T10:15:00.000Z' })
  assignedAt?: string;

  @ApiPropertyOptional({ example: '2026-10-23T10:30:00.000Z' })
  pickedUpAt?: string;

  @ApiPropertyOptional({ example: '2026-10-23T10:55:00.000Z' })
  deliveredAt?: string;

  @ApiProperty({ example: '2026-10-23T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T10:00:00.000Z' })
  updatedAt!: string;
}
