import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { UserStatus } from '#common/enums';

export class AddVendorStaffDto {
  @ApiProperty({ example: 'Senthil Butcher' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'senthil.cuts@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Master Cutter / Butcher' })
  @IsOptional()
  @IsString()
  dutyTitle?: string;
}

export class UpdateVendorStaffDto {
  @ApiPropertyOptional({ example: 'Senthil Butcher' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: [UserStatus.ACTIVE, UserStatus.SUSPENDED], description: 'Suspend or re-activate a staff member' })
  @IsOptional()
  @IsIn([UserStatus.ACTIVE, UserStatus.SUSPENDED])
  status?: UserStatus.ACTIVE | UserStatus.SUSPENDED;

  @ApiPropertyOptional({ example: 'Master Cutter / Butcher' })
  @IsOptional()
  @IsString()
  dutyTitle?: string;
}

export class VendorStaffMemberDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  role!: string;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty()
  shopId!: string;

  @ApiPropertyOptional()
  dutyTitle?: string;

  @ApiProperty()
  createdAt!: string;
}

export class VendorStaffListResponseDto {
  @ApiProperty({ type: [VendorStaffMemberDto] })
  staff!: VendorStaffMemberDto[];

  @ApiProperty({ type: [Object] })
  invitations!: Array<{
    id: string;
    email: string;
    name?: string;
    dutyTitle?: string;
    status: string;
    expiresAt: string;
  }>;
}
