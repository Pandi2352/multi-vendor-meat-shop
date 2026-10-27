import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDetailsResponseDto {
  @ApiProperty({ example: 'muthu@yourshop.in', description: 'Account the link resets' })
  email!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  expiresAt!: Date;
}
