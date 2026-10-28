import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role, UserStatus } from '#common/enums';
import { NormalizePhone, ToLowerCase, Trim } from '#common/transformers';
import { IsIndianPhone } from '#common/validators';
import { UserInvitationResponseDto } from './user-invitation-response.dto.js';

const NAME_MAX = 80;
const DUTY_MAX = 60;

export class AddVendorStaffDto {
  @ApiProperty({ example: 'Senthil Kumar', maxLength: NAME_MAX })
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_MAX)
  name!: string;

  @ApiProperty({ example: 'senthil.cuts@gmail.com' })
  @Trim()
  @ToLowerCase()
  @IsEmail({}, { message: 'Enter a valid email address' })
  email!: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Indian mobile; stored as +91…' })
  @IsOptional()
  @NormalizePhone()
  @IsIndianPhone()
  phone?: string;

  @ApiPropertyOptional({ example: 'Master cutter', maxLength: DUTY_MAX })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(DUTY_MAX)
  dutyTitle?: string;
}

export class UpdateVendorStaffDto {
  @ApiPropertyOptional({ example: 'Senthil Kumar', maxLength: NAME_MAX })
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(NAME_MAX)
  name?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @NormalizePhone()
  @IsIndianPhone()
  phone?: string;

  @ApiPropertyOptional({
    enum: [UserStatus.ACTIVE, UserStatus.SUSPENDED],
    description: 'Suspend or re-activate a staff member',
  })
  @IsOptional()
  @IsIn([UserStatus.ACTIVE, UserStatus.SUSPENDED])
  status?: UserStatus.ACTIVE | UserStatus.SUSPENDED;

  @ApiPropertyOptional({ example: 'Counter & billing', maxLength: DUTY_MAX })
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(DUTY_MAX)
  dutyTitle?: string;
}

export class VendorStaffMemberDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({ enum: [Role.VENDOR_OWNER, Role.VENDOR_STAFF], enumName: 'ShopTeamRole' })
  role!: Role.VENDOR_OWNER | Role.VENDOR_STAFF;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
  status!: UserStatus;

  @ApiPropertyOptional()
  dutyTitle?: string;

  @ApiProperty({ description: 'When they joined the shop (account creation)' })
  createdAt!: string;
}

export class VendorStaffListResponseDto {
  @ApiProperty({ type: [VendorStaffMemberDto], description: 'Owner first, then staff by name' })
  staff!: VendorStaffMemberDto[];

  @ApiProperty({ type: [UserInvitationResponseDto], description: 'Invites not yet accepted (never includes links)' })
  invitations!: UserInvitationResponseDto[];
}
