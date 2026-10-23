import { ApiProperty } from '@nestjs/swagger';

export class FinanceSummaryResponseDto {
  @ApiProperty({ example: 85000, description: 'Payable balance in paise' })
  payableBalancePaise!: number;

  @ApiProperty({ example: 450000, description: 'Total gross sales in paise' })
  totalGrossSalesPaise!: number;

  @ApiProperty({ example: 45000, description: 'Total commission deducted in paise' })
  totalCommissionDeductedPaise!: number;

  @ApiProperty({ example: 40500, description: 'Pending unsettled amount in paise' })
  pendingSettlementPaise!: number;

  @ApiProperty({ example: 364500, description: 'Total settled payout in paise' })
  totalSettledPayoutPaise!: number;

  @ApiProperty({ example: 5, description: 'Count of pending orders awaiting settlement' })
  pendingOrdersCount!: number;
}
