import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressCoordinatesDto {
  @ApiProperty({ example: 13.0418 })
  lat!: number;

  @ApiProperty({ example: 80.2341 })
  lng!: number;
}

export class AddressResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ example: 'HOME', enum: ['HOME', 'WORK', 'OTHER'] })
  label!: string;

  @ApiProperty({ example: 'Flat 4B, Ruby Towers, 2nd Main Road, T. Nagar' })
  text!: string;

  @ApiProperty({ example: '600017' })
  pincode!: string;

  @ApiProperty({ example: 'Chennai' })
  district!: string;

  @ApiProperty({ example: true })
  isDefault!: boolean;

  @ApiPropertyOptional({ type: AddressCoordinatesDto })
  location?: AddressCoordinatesDto;

  @ApiProperty()
  createdAt!: string;
}
