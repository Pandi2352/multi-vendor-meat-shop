import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Role, UserStatus } from '#common/enums';
import { Trim } from '#common/transformers';
import { IsIndianPhone } from '#common/validators';

export class AdminEditUserDto {
  @ApiPropertyOptional({ example: 'Arun Kumar' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 60)
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsIndianPhone()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.OPERATIONS })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Assigned shopId for vendor roles', nullable: true })
  @IsOptional()
  @IsUUID('7')
  shopId?: string | null;
}
