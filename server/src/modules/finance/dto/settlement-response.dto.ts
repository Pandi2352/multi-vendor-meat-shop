import { ApiProperty } from '@nestjs/swagger';
import { SettlementStatus } from '#common/enums';

export class SettlementResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ example: 'SET-261023-7K3FQ' })
  settlementNumber!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty()
  periodStart!: string;

  @ApiProperty()
  periodEnd!: string;

  @ApiProperty({ example: 12, description: 'Number of orders included' })
  orderCount!: number;

  @ApiProperty({ example: 450000, description: 'Gross sales in paise' })
  grossSalesPaise!: number;

  @ApiProperty({ example: 45000, description: 'Total commission deducted in paise' })
  commissionDeductedPaise!: number;

  @ApiProperty({ example: 405000, description: 'Net payout in paise' })
  netPayoutPaise!: number;

  @ApiProperty({ enum: SettlementStatus, example: SettlementStatus.SETTLED })
  status!: SettlementStatus;

  @ApiProperty({ required: false, example: 'HDFC00012345678' })
  utrNumber?: string;

  @ApiProperty({ required: false, example: 'Weekly payout batch' })
  notes?: string;

  @ApiProperty({ required: false })
  settledAt?: string;

  @ApiProperty()
  createdAt!: string;
}
