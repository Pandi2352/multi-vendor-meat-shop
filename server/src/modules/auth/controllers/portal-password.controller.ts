import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, seconds } from '@nestjs/throttler';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Public } from '#common/decorators';
import { PasswordResetService } from '../services/password-reset.service.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { PasswordResetDetailsResponseDto } from '../dto/password-reset-details-response.dto.js';
import { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';

/** Admin portal forgot-password: request an emailed link, check it, set a new password. */
@ApiTags(SwaggerTag.AUTH)
@Controller('auth/portal/password')
@Public()
export class PortalPasswordController {
  constructor(private readonly resets: PasswordResetService) {}

  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Email a password reset link to a portal account',
    description: 'Always answers `sent: true`, whether or not the email has an active portal account.',
  })
  @ApiOkEnvelope(SentOtpResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS)
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.resets.requestReset(dto.email);
  }

  @Get('reset/:token')
  @Throttle({ default: { limit: 20, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Check a password reset link',
    description: 'Fails with RESET_LINK_INVALID; `details.problem` is invalid, used or expired.',
  })
  @ApiOkEnvelope(PasswordResetDetailsResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS)
  details(@Param('token') token: string) {
    return this.resets.getDetails(token);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({
    summary: 'Set a new password from a reset link and sign in',
    description: 'The link works once. Every other session of the account is signed out.',
  })
  @ApiOkEnvelope(AuthResponseDto)
  @ApiStandardResponses(HttpStatus.BAD_REQUEST, HttpStatus.FORBIDDEN, HttpStatus.TOO_MANY_REQUESTS)
  reset(
    @Body() dto: ResetPasswordDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.resets.resetPassword(dto, { userAgent, ipAddress });
  }
}
