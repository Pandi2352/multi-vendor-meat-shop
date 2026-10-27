import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ToLowerCase, Trim } from '#common/transformers';

export class AdminCreateVendorLocationDto {
  @ApiProperty({ example: 9.568 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 77.9624 })
  @IsNumber()
  lng!: number;
}

export class AdminCreateVendorAddressDto {
  @ApiProperty({ example: '14 Madurai Road' })
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @ApiPropertyOptional({ example: 'Opposite Old Bus Stand' })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ example: 'Town Centre' })
  @IsString()
  @IsNotEmpty()
  locality!: string;

  @ApiProperty({ example: 'Virudhunagar' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Virudhunagar' })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: '626001' })
  @Matches(/^626\d{3}$/, { message: 'Pincode must be 626xxx' })
  pincode!: string;

  @ApiPropertyOptional({ type: AdminCreateVendorLocationDto })
  @ValidateNested()
  @Type(() => AdminCreateVendorLocationDto)
  @IsOptional()
  location?: AdminCreateVendorLocationDto;
}

export class AdminCreateVendorDto {
  @ApiProperty({ example: 'M. Ramasamy' })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({ example: '9842012345' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Must be a 10-digit mobile number' })
  phone!: string;

  @ApiProperty({
    example: 'ramasamy@example.com',
    description: 'Sign-in email. The invitation to set a password is sent here.',
  })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Enter a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Sattur Highway Chicken & Mutton' })
  @IsString()
  @IsNotEmpty()
  shopName!: string;

  @ApiProperty({ example: '12426008000456' })
  @Matches(/^\d{14}$/, { message: 'FSSAI number must be 14 digits' })
  fssaiNumber!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fssaiDocumentUrl?: string;

  @ApiProperty({ type: AdminCreateVendorAddressDto })
  @ValidateNested()
  @Type(() => AdminCreateVendorAddressDto)
  address!: AdminCreateVendorAddressDto;

  @ApiPropertyOptional({ example: '06:00' })
  @IsString()
  @IsOptional()
  openingTime?: string;

  @ApiPropertyOptional({ example: '21:00' })
  @IsString()
  @IsOptional()
  closingTime?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  serviceRadiusKm?: number;
}
