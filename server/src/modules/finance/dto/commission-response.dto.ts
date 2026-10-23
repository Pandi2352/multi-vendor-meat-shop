import { ApiProperty } from '@nestjs/swagger';

export class CommissionResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-261023-7K3FQ' })
  orderNumber!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ example: 45000, description: 'Order gross amount in paise' })
  grossAmountPaise!: number;

  @ApiProperty({ example: 1000, description: 'Commission in basis points (1000 = 10%)' })
  commissionBps!: number;

  @ApiProperty({ example: 4500, description: 'Platform commission deducted in paise' })
  commissionAmountPaise!: number;

  @ApiProperty({ example: 40500, description: 'Net earnings for vendor in paise' })
  netVendorAmountPaise!: number;

  @ApiProperty({ example: 'COD' })
  paymentMethod!: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'SETTLED'] })
  status!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  settlementId?: string;

  @ApiProperty()
  createdAt!: string;
}
