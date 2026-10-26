import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { DisputeStatus } from '#common/enums';

export class ResolveDisputeDto {
  @ApiProperty({
    enum: [
      DisputeStatus.RESOLVED_REFUND_FULL,
      DisputeStatus.RESOLVED_REFUND_PARTIAL,
      DisputeStatus.RESOLVED_REJECTED,
      DisputeStatus.UNDER_REVIEW,
    ],
    example: DisputeStatus.RESOLVED_REFUND_FULL,
  })
  @IsEnum(DisputeStatus)
  status!: DisputeStatus;

  @ApiProperty({ description: 'Admin explanation and justification for resolution' })
  @IsString()
  resolutionNotes!: string;

  @ApiProperty({ required: false, description: 'Disbursed refund amount in integer paise', example: 45000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  refundAmountPaise?: number;

  @ApiProperty({ required: false, description: 'Debit the butcher stall ledger', default: true })
  @IsOptional()
  @IsBoolean()
  debitStall?: boolean;

  @ApiProperty({ required: false, description: 'Custom debit penalty amount in paise (defaults to refundAmountPaise)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  debitStallPaise?: number;
}
