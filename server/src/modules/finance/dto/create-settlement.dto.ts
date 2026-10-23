import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSettlementDto {
  @ApiProperty({ description: 'Shop UUID to settle', format: 'uuid' })
  @IsUUID('7')
  shopId!: string;

  @ApiProperty({ required: false, description: 'Bank UTR reference number' })
  @IsOptional()
  @IsString()
  utrNumber?: string;

  @ApiProperty({ required: false, description: 'Optional settlement notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
