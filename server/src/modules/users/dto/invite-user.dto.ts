import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '#common/enums';

export class InviteUserDto {
  @ApiProperty({ example: 'staff@virudhunagar.in' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: 'Murugan Staff' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Role, example: Role.OPERATIONS })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({ format: 'uuid', description: 'Assigned shopId for vendor staff roles' })
  @IsUUID('7')
  @IsOptional()
  shopId?: string;
}
