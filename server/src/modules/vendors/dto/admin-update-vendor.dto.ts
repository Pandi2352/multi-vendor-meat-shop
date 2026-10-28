import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class AdminUpdateVendorDto {
  @ApiPropertyOptional({ example: 'M. Ramasamy' })
  @IsString()
  @IsOptional()
  ownerName?: string;

  @ApiPropertyOptional({ example: '9842012345' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Must be a 10-digit mobile number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Sattur Highway Chicken & Mutton' })
  @IsString()
  @IsOptional()
  shopName?: string;

  @ApiPropertyOptional({ example: 'சாத்தூர் ஹைவே சிக்கன் & மட்டன்' })
  @IsString()
  @IsOptional()
  shopNameTa?: string;

  @ApiPropertyOptional({ example: '12426008000456' })
  @Matches(/^\d{14}$/, { message: 'FSSAI number must be 14 digits' })
  @IsOptional()
  fssaiNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fssaiDocumentUrl?: string;

  @ApiPropertyOptional({ example: 'VDR-MC-VERIFIED' })
  @IsString()
  @IsOptional()
  municipalPermitNumber?: string;

  @ApiPropertyOptional({ example: '14 Madurai Road' })
  @IsString()
  @IsOptional()
  line1?: string;

  @ApiPropertyOptional({ example: 'Town Centre' })
  @IsString()
  @IsOptional()
  locality?: string;

  @ApiPropertyOptional({ example: 'Virudhunagar' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: '626001' })
  @Matches(/^626\d{3}$/, { message: 'Pincode must be 626xxx' })
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: '06:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Must be HH:mm format' })
  @IsOptional()
  openingTime?: string;

  @ApiPropertyOptional({ example: '21:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Must be HH:mm format' })
  @IsOptional()
  closingTime?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  serviceRadiusKm?: number;
}
