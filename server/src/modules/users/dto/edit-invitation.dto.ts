import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Role } from '#common/enums';
import { Trim } from '#common/transformers';

export class EditInvitationDto {
  @ApiPropertyOptional({ example: 'Murugan Butchery Staff' })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 60)
  name?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.VENDOR_STAFF })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ format: 'uuid', description: 'Assigned shopId for vendor roles', nullable: true })
  @IsOptional()
  @IsUUID('7')
  shopId?: string | null;
}
