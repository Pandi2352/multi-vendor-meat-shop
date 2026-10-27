import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShopStatus, VendorVerificationStatus } from '#common/enums';

export class VendorAccessStatusDto {
  @ApiProperty({ enum: VendorVerificationStatus, example: VendorVerificationStatus.SUSPENDED })
  status!: VendorVerificationStatus;

  @ApiProperty({
    description: 'False while products, stock, shop details and staff are locked.',
    example: false,
  })
  canSell!: boolean;

  @ApiPropertyOptional({ example: 'Hygiene inspection pending' })
  reason?: string;

  @ApiPropertyOptional({ example: 'Upload the renewed FSSAI certificate' })
  notes?: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ example: 'Virudhunagar Chettinad Mutton Stall' })
  shopName!: string;

  @ApiProperty({ enum: ShopStatus, example: ShopStatus.CLOSED })
  shopStatus!: ShopStatus;
}
