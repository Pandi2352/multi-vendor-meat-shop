import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, seconds } from '@nestjs/throttler';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Public } from '#common/decorators';
import { AuthService } from '../services/auth.service.js';
import { SendOtpDto } from '../dto/send-otp.dto.js';
import { VerifyOtpDto } from '../dto/verify-otp.dto.js';
import { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';

/** Admin portal sign-in: invite-only, existing staff / vendor / delivery accounts only. */
@ApiTags(SwaggerTag.AUTH)
@Controller('auth/portal')
@Public()
export class PortalAuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Send a sign-in code to a portal user',
    description:
      'Always answers `sent: true`. A code is emailed only when the address belongs to an existing portal account.',
  })
  @ApiOkEnvelope(SentOtpResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendPortalOtp(dto);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Verify a portal sign-in code and issue tokens (never creates accounts)' })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.TOO_MANY_REQUESTS)
  verifyOtp(@Body() dto: VerifyOtpDto, @Headers('user-agent') userAgent?: string, @Ip() ipAddress?: string) {
    return this.auth.verifyPortalOtp(dto, { userAgent, ipAddress });
  }
}
