import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '#common/enums';

export class AssignRoleDto {
  @ApiProperty({ enum: Role, example: Role.OPERATIONS })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({ format: 'uuid', description: 'Assigned shopId for vendor roles' })
  @IsUUID('7')
  @IsOptional()
  shopId?: string;
}
