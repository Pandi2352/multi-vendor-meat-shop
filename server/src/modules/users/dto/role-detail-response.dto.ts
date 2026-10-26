import { ApiProperty } from '@nestjs/swagger';
import { Permission, Role } from '#common/enums';

export class RoleDetailResponseDto {
  @ApiProperty({ enum: Role, example: Role.OPERATIONS })
  role!: Role;

  @ApiProperty({ example: 'Operations Team' })
  name!: string;

  @ApiProperty({ example: 'Manages catalog, verify vendors, view orders and delivery tasks' })
  description!: string;

  @ApiProperty({ example: 3 })
  userCount!: number;

  @ApiProperty({ enum: Permission, isArray: true })
  permissions!: Permission[];

  @ApiProperty({ example: true })
  isSystem!: boolean;
}
