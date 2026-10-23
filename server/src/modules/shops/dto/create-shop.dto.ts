import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '#common/dto';
import { Trim } from '#common/transformers';
import { IsIndianPhone, IsPaise, IsTimeHHmm } from '#common/validators';

export class CreateShopDto {
  @ApiProperty({ example: 'Murugan Fresh Mutton & Chicken' })
  @Trim()
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiPropertyOptional({ example: 'Fresh country chicken and tender goat cuts' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(0, 300)
  description?: string;

  @ApiProperty({ example: '+919876543210' })
  @IsIndianPhone()
  phone!: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @ApiPropertyOptional({ example: '06:00', default: '06:00' })
  @IsOptional()
  @IsTimeHHmm()
  openingTime: string = '06:00';

  @ApiPropertyOptional({ example: '21:00', default: '21:00' })
  @IsOptional()
  @IsTimeHHmm()
  closingTime: string = '21:00';

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  serviceRadiusKm: number = 5;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Minimum order amount in paise' })
  @IsOptional()
  @IsPaise({ allowZero: true })
  minOrderPaise: number = 0;

  @ApiPropertyOptional({ example: 3000, default: 3000, description: 'Delivery fee in paise (₹30)' })
  @IsOptional()
  @IsPaise({ allowZero: true })
  deliveryFeePaise: number = 3000;

  @ApiPropertyOptional({ example: 50000, description: 'Free delivery threshold in paise (₹500)' })
  @IsOptional()
  @IsPaise()
  freeDeliveryAbovePaise?: number;

  @ApiPropertyOptional({ type: [String], example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[] = [];
}
