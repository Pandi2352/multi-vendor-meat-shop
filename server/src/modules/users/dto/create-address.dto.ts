import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'HOME', enum: ['HOME', 'WORK', 'OTHER'] })
  @IsIn(['HOME', 'WORK', 'OTHER'])
  label!: string;

  @ApiProperty({ example: 'Flat 4B, Ruby Towers, 2nd Main Road, T. Nagar' })
  @IsString()
  @Length(5, 200)
  text!: string;

  @ApiProperty({ example: '600017' })
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Pincode must be a valid 6-digit Indian PIN code' })
  pincode!: string;

  @ApiProperty({ example: 'Chennai' })
  @IsString()
  @Length(2, 60)
  district!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 13.0418 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 80.2341 })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
