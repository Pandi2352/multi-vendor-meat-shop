import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { TN_DISTRICT_CODES, type TnDistrictCode } from '#common/constants';
import { ListQueryDto } from '#common/dto';
import { ShopStatus } from '#common/enums';
import { ToNumber } from '#common/transformers';
import { IsDistrict } from '#common/validators';

export class QueryShopsDto extends ListQueryDto {
  @ApiPropertyOptional({ example: 13.0827 })
  @IsOptional()
  @ToNumber()
  @IsLatitude()
  lat?: number;

  @ApiPropertyOptional({ example: 80.2707 })
  @IsOptional()
  @ToNumber()
  @IsLongitude()
  lng?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0.5)
  @Max(50)
  radiusKm?: number = 10;

  @ApiPropertyOptional({ enum: TN_DISTRICT_CODES })
  @IsOptional()
  @IsDistrict()
  district?: TnDistrictCode;

  @ApiPropertyOptional({ enum: ShopStatus })
  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;
}
