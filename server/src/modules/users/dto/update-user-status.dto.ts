import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '#common/enums';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status!: UserStatus;
}
