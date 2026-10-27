import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ToLowerCase, Trim } from '#common/transformers';

export class ApplyVendorDto {
  @ApiProperty({ example: 'M. Ramasamy' })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({ example: 'Sattur Highway Chicken & Mutton' })
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @ApiProperty({ example: '9842012345' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number' })
  phone!: string;

  @ApiProperty({
    example: 'ramasamy@example.com',
    description: 'Sign-in email. The invitation to set a password is sent here.',
  })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Enter a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Sattur' })
  @IsString()
  @IsNotEmpty()
  town!: string;

  @ApiProperty({ example: 'Main Bazaar' })
  @IsString()
  @IsNotEmpty()
  locality!: string;

  @ApiProperty({ example: '12 Kovilpatti Road, Near Old Bus Stand' })
  @IsString()
  @IsNotEmpty()
  addressLine!: string;

  @ApiProperty({ example: '626203' })
  @Matches(/^626\d{3}$/, {
    message: 'Pincode must be a 6-digit Virudhunagar district PIN (626xxx)',
  })
  pincode!: string;

  @ApiProperty({ example: '12426008000456' })
  @Matches(/^\d{14}$/, { message: 'FSSAI number must be 14 digits' })
  fssaiNumber!: string;

  @ApiPropertyOptional({ example: ['Chicken', 'Mutton'] })
  @IsArray()
  @IsOptional()
  categoriesOffered?: string[];

  @ApiPropertyOptional({ example: '06:00' })
  @IsString()
  @IsOptional()
  openingTime?: string;

  @ApiPropertyOptional({ example: '21:00' })
  @IsString()
  @IsOptional()
  closingTime?: string;

  @ApiPropertyOptional({ example: 'Country chicken and fresh goat mutton supplied daily' })
  @IsString()
  @IsOptional()
  notes?: string;
}
