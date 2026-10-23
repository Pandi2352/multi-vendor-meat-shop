import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { TN_DISTRICT_CODES, type TnDistrictCode } from '#common/constants';
import { Trim } from '#common/transformers';
import { IsDistrict, IsPincode } from '#common/validators';
import { LatLngDto } from './geo.dto.js';

export class AddressDto {
  @ApiProperty({ example: '12, Gandhi Street' })
  @Trim()
  @IsString()
  @Length(3, 120)
  line1!: string;

  @ApiPropertyOptional({ example: 'Near Murugan Temple' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(0, 120)
  line2?: string;

  @ApiProperty({ example: 'T. Nagar' })
  @Trim()
  @IsString()
  @Length(2, 80)
  locality!: string;

  @ApiProperty({ example: 'Chennai' })
  @Trim()
  @IsString()
  @Length(2, 80)
  city!: string;

  @ApiProperty({ enum: TN_DISTRICT_CODES, example: 'CHENNAI' })
  @IsDistrict()
  district!: TnDistrictCode;

  @ApiProperty({ example: '600017' })
  @Trim()
  @IsPincode()
  pincode!: string;

  @ApiPropertyOptional({ type: LatLngDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LatLngDto)
  location?: LatLngDto;
}
