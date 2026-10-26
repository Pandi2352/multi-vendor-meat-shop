import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'Verified shop premises and municipal hygiene audit passed' })
  @IsOptional()
  @Trim()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['broiler-chicken', 'goat-mutton'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedCategories?: string[];

  @ApiPropertyOptional({ example: 'VDR-MC-2026-8819' })
  @IsOptional()
  @Trim()
  @IsString()
  municipalPermitNumber?: string;
}
