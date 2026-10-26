import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeReason, DisputeStatus } from '#common/enums';

export class DisputeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'TKT-261026-7K3FQ' })
  ticketNumber!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-261023-9A1B2' })
  orderNumber!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ format: 'uuid' })
  customerId!: string;

  @ApiPropertyOptional()
  customerName?: string;

  @ApiPropertyOptional()
  customerPhone?: string;

  @ApiProperty({ enum: DisputeReason })
  reason!: DisputeReason;

  @ApiProperty({ enum: DisputeStatus })
  status!: DisputeStatus;

  @ApiProperty()
  customerComments!: string;

  @ApiProperty({ type: [String] })
  evidencePhotoUrls!: string[];

  @ApiProperty({ description: 'Amount in paise' })
  claimedAmountPaise!: number;

  @ApiPropertyOptional({ description: 'Refunded amount in paise' })
  refundAmountPaise?: number;

  @ApiPropertyOptional({ description: 'Debited stall amount in paise' })
  debitStallPaise?: number;

  @ApiPropertyOptional()
  resolutionNotes?: string;

  @ApiPropertyOptional()
  resolvedBy?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
