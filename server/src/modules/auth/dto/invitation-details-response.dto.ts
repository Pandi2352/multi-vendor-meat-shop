import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus, Role } from '#common/enums';

export class InvitationDetailsResponseDto {
  @ApiProperty({ example: 'Murugesan Pandian' })
  email!: string;

  @ApiPropertyOptional({ example: 'S. Murugesan' })
  name?: string;

  @ApiProperty({ enum: Role, example: Role.OPERATIONS })
  role!: Role;

  @ApiPropertyOptional({ example: '018f...shop_id' })
  shopId?: string | null;

  @ApiProperty({ enum: InvitationStatus, example: InvitationStatus.PENDING })
  status!: InvitationStatus;

  @ApiPropertyOptional({ example: 'Virudhunagar Chettinad Mutton Stall', description: 'Shop staff and owner invites' })
  shopName?: string;

  @ApiProperty({ example: false })
  isExpired!: boolean;

  @ApiProperty()
  expiresAt!: Date;
}
