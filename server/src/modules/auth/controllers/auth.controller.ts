import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiCreatedEnvelope, ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser, Public } from '#common/decorators';
import { UserResponseDto, UsersService } from '#modules/users';
import { AuthService } from '../services/auth.service.js';
import { SendOtpDto } from '../dto/send-otp.dto.js';
import { VerifyOtpDto } from '../dto/verify-otp.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';

@ApiTags(SwaggerTag.AUTH)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('otp/send')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 6-digit OTP verification email' })
  @ApiOkEnvelope(SentOtpResponseDto)
  @ApiStandardResponses()
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto);
  }

  @Post('otp/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and issue JWT access + refresh tokens' })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses()
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.auth.verifyOtp(dto, { userAgent, ipAddress });
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and issue new JWT pair' })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses()
  refresh(
    @Body() dto: RefreshTokenDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.auth.refreshToken(dto, { userAgent, ipAddress });
  }

  @Post('logout')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke sessions and log out' })
  @ApiStandardResponses()
  logout(@CurrentUser('id') userId: string) {
    return this.auth.logout(userId);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkEnvelope(UserResponseDto)
  @ApiStandardResponses()
  me(@CurrentUser('id') userId: string) {
    return this.users.getProfile(userId);
  }
}
