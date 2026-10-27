import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '#modules/users';

export class AuthResponseDto {
  @ApiProperty({ description: 'Short-lived JWT Access Token' })
  accessToken!: string;

  @ApiProperty({ description: 'Rotating JWT Refresh Token' })
  refreshToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class SentOtpResponseDto {
  @ApiProperty({ example: true })
  sent!: boolean;

  @ApiProperty({ example: 60, description: 'Seconds until another code or link can be requested' })
  cooldownSeconds!: number;
}
