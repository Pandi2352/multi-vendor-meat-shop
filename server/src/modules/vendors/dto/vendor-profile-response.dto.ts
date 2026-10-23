import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorVerificationStatus } from '#common/enums';

export class VendorProfileResponseDto {
  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5d' })
  userId!: string;

  @ApiProperty({ example: 'Arun Meat Mart' })
  businessName!: string;

  @ApiProperty({ example: 'Arun Kumar' })
  ownerName!: string;

  @ApiProperty({ example: '12423008000123' })
  fssaiNumber!: string;

  @ApiPropertyOptional({ example: 'https://example.com/docs/fssai.pdf' })
  fssaiDocumentUrl?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  panNumber?: string;

  @ApiPropertyOptional({ example: '33AAAAA0000A1Z5' })
  gstin?: string;

  @ApiProperty({ enum: VendorVerificationStatus, example: VendorVerificationStatus.APPROVED })
  status!: VendorVerificationStatus;

  @ApiPropertyOptional({ example: 'Document verified' })
  rejectionReason?: string;

  @ApiPropertyOptional({ example: '2026-10-23T12:00:00.000Z' })
  verifiedAt?: string;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  updatedAt!: string;
}
