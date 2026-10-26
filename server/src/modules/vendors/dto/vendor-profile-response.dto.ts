import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorVerificationStatus } from '#common/enums';

export class VendorShopSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Virudhunagar Chettinad Mutton Stall' })
  name!: string;

  @ApiProperty({ example: '9842012345' })
  phone!: string;

  @ApiProperty({ example: 'OPEN' })
  status!: string;

  @ApiProperty({ example: '14 Madurai Road' })
  line1!: string;

  @ApiProperty({ example: 'Town Centre' })
  locality!: string;

  @ApiProperty({ example: 'Virudhunagar' })
  city!: string;

  @ApiProperty({ example: 'Virudhunagar' })
  district!: string;

  @ApiProperty({ example: '626001' })
  pincode!: string;
}

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

  @ApiPropertyOptional({ type: VendorShopSummaryDto })
  shop?: VendorShopSummaryDto;
}
