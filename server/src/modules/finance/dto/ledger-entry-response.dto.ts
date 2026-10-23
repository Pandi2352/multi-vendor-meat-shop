import { ApiProperty } from '@nestjs/swagger';
import { LedgerDirection, LedgerEntryType } from '#common/enums';

export class LedgerEntryResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ enum: LedgerDirection, example: LedgerDirection.CREDIT })
  direction!: LedgerDirection;

  @ApiProperty({ enum: LedgerEntryType, example: LedgerEntryType.SALE })
  entryType!: LedgerEntryType;

  @ApiProperty({ example: 40500, description: 'Amount in paise' })
  amountPaise!: number;

  @ApiProperty({ example: 'ORDER' })
  referenceType!: string;

  @ApiProperty({ example: 'ORD-261023-7K3FQ' })
  referenceId!: string;

  @ApiProperty({ example: 'Net proceeds from COD delivery ORD-261023-7K3FQ' })
  description!: string;

  @ApiProperty({ example: 125000, description: 'Running balance in paise' })
  balanceAfterPaise!: number;

  @ApiProperty()
  createdAt!: string;
}
