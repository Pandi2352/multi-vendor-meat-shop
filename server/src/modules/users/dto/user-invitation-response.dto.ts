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

  @ApiPropertyOptional({
    description: 'One-time set-password link. Returned only when the invitation is issued or re-sent; never stored or listed.',
    example: 'http://localhost:3001/accept-invite?token=…',
  })
  inviteUrl?: string;

  @ApiPropertyOptional({ description: 'Whether the invitation email was sent. Present only on issue/resend.', example: true })
  emailSent?: boolean;

  @ApiPropertyOptional({ example: 'Master cutter', description: 'Shop staff invites: their job at the shop' })
  dutyTitle?: string;

  @ApiProperty({ example: false, description: 'Past its expiry date (the status may still say PENDING)' })
  isExpired!: boolean;

  @ApiProperty({ example: '2026-10-26T12:00:00.000Z' })
  createdAt!: string;
}
