import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { Permission } from '#common/enums';

export class UpdateRolePermissionsDto {
  @ApiProperty({ enum: Permission, isArray: true })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}
