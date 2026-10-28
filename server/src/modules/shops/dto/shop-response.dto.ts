import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from '#common/dto';
import { ShopStatus } from '#common/enums';

export class ShopResponseDto {
  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5d' })
  vendorId!: string;

  @ApiProperty({ example: 'Murugan Fresh Mutton & Chicken' })
  name!: string;

  @ApiPropertyOptional({ example: 'முருகன் ஃபிரஷ் மட்டன் & சிக்கன்' })
  nameTa?: string;

  @ApiProperty({ example: 'murugan-fresh-mutton-chicken' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Fresh country chicken and tender goat cuts' })
  description?: string;

  @ApiProperty({ example: '+919876543210' })
  phone!: string;

  @ApiProperty({ type: AddressDto })
  address!: AddressDto;

  @ApiProperty({ enum: ShopStatus, example: ShopStatus.OPEN })
  status!: ShopStatus;

  @ApiProperty({ example: '06:00' })
  openingTime!: string;

  @ApiProperty({ example: '21:00' })
  closingTime!: string;

  @ApiProperty({ example: 5 })
  serviceRadiusKm!: number;

  @ApiProperty({ example: 0, description: 'Minimum order amount in paise' })
  minOrderPaise!: number;

  @ApiProperty({ example: 3000, description: 'Delivery fee in paise' })
  deliveryFeePaise!: number;

  @ApiPropertyOptional({ example: 50000 })
  freeDeliveryAbovePaise?: number;

  @ApiProperty({ type: [String], example: [] })
  images!: string[];

  @ApiProperty({ example: 4.8, description: 'Average customer rating out of 5' })
  ratingAverage!: number;

  @ApiProperty({ example: 24, description: 'Total number of customer reviews' })
  ratingCount!: number;

  @ApiPropertyOptional({ example: 1450, description: 'Distance in meters computed by $geoNear' })
  distanceMeters?: number;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  updatedAt!: string;
}
