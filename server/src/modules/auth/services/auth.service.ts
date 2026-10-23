import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '#common/exceptions';
import { UserStatus, ROLE_PERMISSIONS } from '#common/enums';
import { sha256 } from '#common/utils';
import { UsersService, toUserResponseDto } from '#modules/users';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly sessionRepo: RefreshSessionRepository,
  ) {}

  sendOtp(dto: SendOtpDto): Promise<SentOtpResponseDto> {
    return this.otpService.sendOtp(dto.email);
  }

  async verifyOtp(dto: VerifyOtpDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    await this.otpService.verifyOtp(dto.email, dto.otp);

    const user = await this.usersService.findOrCreateByEmail(dto.email);
    if (user.status === UserStatus.SUSPENDED) {
      throw new AppException(ErrorCode.ACCOUNT_SUSPENDED);
    }

    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await this.sessionRepo.create({
      userId: user._id,
      tokenHash: 'pending',
      expiresAt: sessionExpiresAt,
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

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
    };
  }

  async refreshToken(dto: RefreshTokenDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    const { sub: userId, sid: sessionId } = this.tokenService.verifyRefreshToken(dto.refreshToken);

    const session = await this.sessionRepo.findActiveSession(sessionId);
    if (!session) {
      throw new AppException(ErrorCode.AUTH_SESSION_REVOKED);
    }

    const user = await this.usersService.findByIdOrThrow(userId);
    if (user.status === UserStatus.SUSPENDED) {
      throw new AppException(ErrorCode.ACCOUNT_SUSPENDED);
    }

    await this.sessionRepo.updateById(session._id, { revoked: true });

    const newSessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const newSession = await this.sessionRepo.create({
      userId: user._id,
      tokenHash: 'pending',
      expiresAt: newSessionExpiresAt,
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
    const refreshToken = this.tokenService.signRefreshToken(newSession._id, user._id);

    await this.sessionRepo.updateById(newSession._id, { tokenHash: sha256(refreshToken) });

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.sessionRepo.revokeAllForUser(userId);
    return { success: true };
  }
}
