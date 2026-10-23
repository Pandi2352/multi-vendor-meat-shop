import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length, Matches } from 'class-validator';
import { Trim } from '#common/transformers';

export class AssignDeliveryTaskDto {
  @ApiProperty({ example: '018f1234-abcd-7000-8000-000000000005' })
  @IsUUID('7')
  partnerId!: string;

  @ApiProperty({ example: 'Karthik Rider' })
  @Trim()
  @IsString()
  @Length(2, 60)
  partnerName!: string;

  @ApiProperty({ example: '+919876543210' })
  @Trim()
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'partnerPhone must be a valid E.164 Indian mobile number (+91...)' })
  partnerPhone!: string;
}
