import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '#common/enums';
import { Trim } from '#common/transformers';
import { IsPincode } from '#common/validators';

export class OrderDeliveryLocationDto {
  @ApiProperty({ example: 13.0418 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 80.2341 })
  @IsNumber()
  lng!: number;
}

export class OrderDeliveryAddressDto {
  @ApiProperty({ example: 'Flat 4B, Emerald Apts, 12 Gandhi Road, T. Nagar, Chennai' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @Length(5, 250)
  text!: string;

  @ApiProperty({ example: '600017' })
  @Trim()
  @IsPincode()
  pincode!: string;

  @ApiProperty({ example: 'Chennai' })
  @Trim()
  @IsString()
  @Length(2, 60)
  district!: string;

  @ApiProperty({ type: OrderDeliveryLocationDto })
  @ValidateNested()
  @Type(() => OrderDeliveryLocationDto)
  location!: OrderDeliveryLocationDto;

  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 40)
  label?: string;
}

export class OrderSlotDto {
  @ApiProperty({ example: '2026-10-23' })
  @IsString()
  date!: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime!: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime!: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: OrderDeliveryAddressDto })
  @ValidateNested()
  @Type(() => OrderDeliveryAddressDto)
  deliveryAddress!: OrderDeliveryAddressDto;

  @ApiPropertyOptional({ example: 'Please ring the doorbell and leave at doorstep' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(0, 300)
  customerNotes?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.COD })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod = PaymentMethod.COD;

  @ApiPropertyOptional({ type: OrderSlotDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSlotDto)
  slot?: OrderSlotDto;
}
