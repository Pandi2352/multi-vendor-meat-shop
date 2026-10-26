import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { DisputeReason } from '#common/enums';

export class CreateDisputeDto {
  @ApiProperty({ description: 'Order UUID', format: 'uuid' })
  @IsUUID('7')
  orderId!: string;

  @ApiProperty({ enum: DisputeReason, example: DisputeReason.QUALITY_FRESHNESS })
  @IsEnum(DisputeReason)
  reason!: DisputeReason;

  @ApiProperty({ description: 'Customer description of meat complaint' })
  @IsString()
  customerComments!: string;

  @ApiProperty({ description: 'Claimed refund amount in integer paise', example: 45000 })
  @IsInt()
  @Min(0)
  claimedAmountPaise!: number;

  @ApiProperty({ required: false, type: [String], description: 'Evidence photo URLs (scales, discoloration)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidencePhotoUrls?: string[];
}
