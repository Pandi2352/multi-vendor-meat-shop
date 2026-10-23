import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VendorVerificationStatus } from '#common/enums';
import { Trim } from '#common/transformers';

export class VerifyVendorDto {
  @ApiProperty({
    enum: [
      VendorVerificationStatus.APPROVED,
      VendorVerificationStatus.REJECTED,
      VendorVerificationStatus.RESUBMISSION_REQUIRED,
      VendorVerificationStatus.UNDER_REVIEW,
      VendorVerificationStatus.SUSPENDED,
    ],
    example: VendorVerificationStatus.APPROVED,
  })
  @IsEnum(VendorVerificationStatus)
  status!: VendorVerificationStatus;

  @ApiPropertyOptional({ example: 'FSSAI licence document is expired or unreadable' })
  @IsOptional()
  @Trim()
  @IsString()
  rejectionReason?: string;
}
