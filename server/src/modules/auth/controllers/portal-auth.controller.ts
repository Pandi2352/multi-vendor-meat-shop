import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, seconds } from '@nestjs/throttler';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Public } from '#common/decorators';
import { AuthService } from '../services/auth.service.js';
import { PortalLoginDto } from '../dto/portal-login.dto.js';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto.js';
import { InvitationDetailsResponseDto } from '../dto/invitation-details-response.dto.js';
import { SendOtpDto } from '../dto/send-otp.dto.js';
import { VerifyOtpDto } from '../dto/verify-otp.dto.js';
import { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';

/** Admin portal sign-in and invitation onboarding */
@ApiTags(SwaggerTag.AUTH)
@Controller('auth/portal')
@Public()
export class PortalAuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Email + Password authentication for portal users',
    description: 'Fast, secure sign-in for platform administrators, stall managers, and operations staff without OTP friction.',
  })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.TOO_MANY_REQUESTS)
  login(
    @Body() dto: PortalLoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.auth.loginPortalWithPassword(dto, { userAgent, ipAddress });
  }

  @Get('invitations/:token')
  @ApiOperation({ summary: 'Verify an onboarding invitation token and retrieve invite metadata' })
  @ApiOkEnvelope(InvitationDetailsResponseDto)
  @ApiStandardResponses(HttpStatus.NOT_FOUND)
  getInvitation(@Param('token') token: string) {
    return this.auth.getInvitationDetails(token);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept invitation, set user password, activate account, and issue session tokens',
  })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT, HttpStatus.NOT_FOUND)
  acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.auth.acceptInvitationAndSetPassword(dto, { userAgent, ipAddress });
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Send a sign-in code to a portal user (OTP fallback)' })
  @ApiOkEnvelope(SentOtpResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendPortalOtp(dto);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Verify a portal sign-in code and issue tokens' })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.TOO_MANY_REQUESTS)
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.auth.verifyPortalOtp(dto, { userAgent, ipAddress });
  }
}
