import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { GEO } from '#common/constants';
import { ToNumber } from '#common/transformers';

export class LatLngDto {
  @ApiProperty({ example: 13.0827 })
  @ToNumber()
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: 80.2707 })
  @ToNumber()
  @IsLongitude()
  lng!: number;
}

export class GeoQueryDto extends LatLngDto {
  @ApiPropertyOptional({ default: GEO.DEFAULT_RADIUS_KM, maximum: GEO.MAX_RADIUS_KM })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0.1)
  @Max(GEO.MAX_RADIUS_KM)
  radiusKm: number = GEO.DEFAULT_RADIUS_KM;
}
