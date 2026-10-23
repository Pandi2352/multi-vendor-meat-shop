import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '#common/exceptions';
import { ROLE_PERMISSIONS, UserStatus, isPortalRole } from '#common/enums';
import { sha256 } from '#common/utils';
import { AppConfigService } from '#config';
import { UsersService, toUserResponseDto, type User } from '#modules/users';
import { OtpService } from './otp.service.js';
import { TokenService } from './token.service.js';
import { RefreshSessionRepository } from '../repositories/refresh-session.repository.js';
import type { SendOtpDto } from '../dto/send-otp.dto.js';
import type { VerifyOtpDto } from '../dto/verify-otp.dto.js';
import type { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import type { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';

interface RequestContext {
  userAgent?: string;
  ipAddress?: string;
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly config: AppConfigService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly sessionRepo: RefreshSessionRepository,
  ) {}

  // ---------- Storefront (customers sign up by verifying their email) ----------

  sendOtp(dto: SendOtpDto): Promise<SentOtpResponseDto> {
    return this.otpService.sendOtp(dto.email);
  }

  async verifyOtp(dto: VerifyOtpDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    await this.otpService.verifyOtp(dto.email, dto.otp);
    const user = await this.usersService.findOrCreateByEmail(dto.email);
    return this.issueSession(user, ctx);
  }

  // ---------- Admin portal (invite-only: never creates accounts) ----------

  /**
   * Sends a code only to existing portal users. Unknown or customer emails get the same
   * response without an email, so the endpoint can't be used to discover who has access.
   */
  async sendPortalOtp(dto: SendOtpDto): Promise<SentOtpResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !isPortalRole(user.role)) {
      return { sent: true, cooldownSeconds: this.config.auth.otp.resendCooldownSeconds };
    }
    return this.otpService.sendOtp(dto.email);
  }

  async verifyPortalOtp(dto: VerifyOtpDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    // Same error as a wrong code: no hint whether the email has portal access.
    if (!user || !isPortalRole(user.role)) throw new AppException(ErrorCode.OTP_INVALID);

    await this.otpService.verifyOtp(dto.email, dto.otp);
    return this.issueSession(user, ctx);
  }

  // ---------- Sessions ----------

  async refreshToken(dto: RefreshTokenDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    const { sub: userId, sid: sessionId } = this.tokenService.verifyRefreshToken(dto.refreshToken);

    const session = await this.sessionRepo.findActiveSession(sessionId);
    if (!session) throw new AppException(ErrorCode.AUTH_SESSION_REVOKED);

    const user = await this.usersService.findByIdOrThrow(userId);
    const result = await this.issueSession(user, ctx);
    await this.sessionRepo.updateById(session._id, { revoked: true });
    return result;
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.sessionRepo.revokeAllForUser(userId);
    return { success: true };
  }

  /** Creates a refresh session and signs the token pair. Suspended accounts are refused. */
  private async issueSession(user: User, ctx: RequestContext): Promise<AuthResponseDto> {
    if (user.status === UserStatus.SUSPENDED) throw new AppException(ErrorCode.ACCOUNT_SUSPENDED);

    const session = await this.sessionRepo.create({
      userId: user._id,
      tokenHash: 'pending',
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      revoked: false,
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    });

    const accessToken = this.tokenService.signAccessToken({
      id: user._id,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] ?? [],
      shopId: user.shopId ?? undefined,
    });
    const refreshToken = this.tokenService.signRefreshToken(session._id, user._id);
    await this.sessionRepo.updateById(session._id, { tokenHash: sha256(refreshToken) });

    return { accessToken, refreshToken, user: toUserResponseDto(user) };
  }
}
