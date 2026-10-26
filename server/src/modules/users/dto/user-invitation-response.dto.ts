import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus, Role } from '#common/enums';

export class UserInvitationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'staff@virudhunagar.in' })
  email!: string;

  @ApiPropertyOptional({ example: 'Murugan Staff' })
  name?: string;

  @ApiPropertyOptional({ example: '+919842012345' })
  phone?: string;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiPropertyOptional({ format: 'uuid' })
  shopId?: string | null;

  @ApiProperty({ format: 'uuid' })
  invitedBy!: string;

  @ApiProperty({ enum: InvitationStatus })
  status!: InvitationStatus;

  @ApiProperty({ example: '2026-11-02T12:00:00.000Z' })
  expiresAt!: string;

  @ApiPropertyOptional({ example: '2026-10-26T12:00:00.000Z' })
  acceptedAt?: string | null;

  @ApiProperty({ example: '2026-10-26T12:00:00.000Z' })
  createdAt!: string;
}
