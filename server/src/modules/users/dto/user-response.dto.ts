import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, UserStatus } from '#common/enums';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c' })
  id!: string;

  @ApiProperty({ example: 'customer@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'Arun Kumar' })
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phone?: string;

  @ApiProperty({ enum: Role, example: Role.CUSTOMER })
  role!: Role;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status!: UserStatus;

  @ApiPropertyOptional({ format: 'uuid', nullable: true, example: null })
  shopId?: string | null;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T12:00:00.000Z' })
  updatedAt!: string;
}
