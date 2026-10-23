import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { Trim } from '#common/transformers';

export class CreateVendorProfileDto {
  @ApiProperty({ example: 'Arun Meat Mart' })
  @Trim()
  @IsString()
  @Length(2, 100)
  businessName!: string;

  @ApiProperty({ example: 'Arun Kumar' })
  @Trim()
  @IsString()
  @Length(2, 80)
  ownerName!: string;

  @ApiProperty({ example: '12423008000123', description: '14-digit FSSAI licence number' })
  @Trim()
  @IsString()
  @Matches(/^\d{14}$/, { message: 'FSSAI licence number must be exactly 14 digits' })
  fssaiNumber!: string;

  @ApiPropertyOptional({ example: 'https://example.com/docs/fssai.pdf' })
  @IsOptional()
  @Trim()
  @IsString()
  fssaiDocumentUrl?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(10, 10)
  panNumber?: string;

  @ApiPropertyOptional({ example: '33AAAAA0000A1Z5' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(15, 15)
  gstin?: string;
}
