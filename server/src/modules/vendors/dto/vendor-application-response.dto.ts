import { ApiProperty } from '@nestjs/swagger';
import { VendorVerificationStatus } from '#common/enums';

export class VendorApplicationResponseDto {
  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c' })
  applicationId!: string;

  @ApiProperty({ enum: VendorVerificationStatus, example: VendorVerificationStatus.SUBMITTED })
  status!: VendorVerificationStatus;

  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5d' })
  shopId!: string;

  @ApiProperty({ example: 'Vendor application submitted successfully. Verification pending.' })
  message!: string;
}
