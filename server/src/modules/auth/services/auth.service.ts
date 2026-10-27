import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '#common/exceptions';
import { InvitationStatus, ROLE_PERMISSIONS, isPortalRole } from '#common/enums';
import { hashPassword, sha256, verifyPassword } from '#common/utils';
import { AppConfigService } from '#config';
import { UserInvitationRepository, UsersService, toUserResponseDto, type User } from '#modules/users';
import { OtpService } from './otp.service.js';
import { TokenService } from './token.service.js';
import { assertCanSignIn } from '../utils/account-status.util.js';
import { RefreshSessionRepository } from '../repositories/refresh-session.repository.js';
import type { SendOtpDto } from '../dto/send-otp.dto.js';
import type { VerifyOtpDto } from '../dto/verify-otp.dto.js';
import type { RefreshTokenDto } from '../dto/refresh-token.dto.js';
import type { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';
import type { PortalLoginDto } from '../dto/portal-login.dto.js';
import type { AcceptInvitationDto } from '../dto/accept-invitation.dto.js';
import type { InvitationDetailsResponseDto } from '../dto/invitation-details-response.dto.js';

export interface RequestContext {
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
    private readonly invitationRepo: UserInvitationRepository,
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

  // ---------- Admin portal: Email + Password Authentication ----------

  /**
   * Password-based sign-in for staff, vendors, delivery partners, and admins.
   * Direct, fast, and eliminates OTP friction on recurring administrative logins.
   */
  async loginPortalWithPassword(dto: PortalLoginDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !isPortalRole(user.role)) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, { message: 'Invalid email or password' });
    }

    if (!user.passwordHash) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        message: 'Password has not been set yet. Please check your invitation link to set your password.',
      });
    }

    const isMatch = verifyPassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, { message: 'Invalid email or password' });
    }

    return this.issueSession(user, ctx);
  }

  // ---------- Admin portal: Invited User Onboarding & Password Setup ----------

  /** Get details of an onboarding invitation by secure token */
  async getInvitationDetails(token: string): Promise<InvitationDetailsResponseDto> {
    const invitation = await this.invitationRepo.findByToken(token);
    if (!invitation) {
      throw new AppException(ErrorCode.NOT_FOUND, { message: 'Invitation not found or invalid' });
    }

    const isExpired = invitation.expiresAt < new Date();
    return {
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      shopId: invitation.shopId,
      status: invitation.status,
      isExpired,
      expiresAt: invitation.expiresAt,
    };
  }

  /** Invited user sets their password, activates account, and enters the portal */
  async acceptInvitationAndSetPassword(
    dto: AcceptInvitationDto,
    ctx: RequestContext = {},
  ): Promise<AuthResponseDto> {
    const invitation = await this.invitationRepo.findByToken(dto.token);
    if (!invitation) {
      throw new AppException(ErrorCode.NOT_FOUND, { message: 'Invitation not found or invalid' });
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new AppException(ErrorCode.CONFLICT, {
        message: 'Invitation has already been accepted. Please sign in with your password.',
      });
    }

    if (invitation.status !== InvitationStatus.PENDING || invitation.expiresAt < new Date()) {
      throw new AppException(ErrorCode.BUSINESS_RULE_VIOLATION, {
        message: 'Invitation is expired or has been revoked',
      });
    }

    const passwordHash = hashPassword(dto.password);
    const user = await this.usersService.createOrActivateInvitedUser({
      email: invitation.email,
      role: invitation.role,
      name: dto.name || invitation.name,
      phone: invitation.phone,
      shopId: invitation.shopId,
      passwordHash,
    });

    await this.invitationRepo.updateById(invitation._id, {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
    });

    return this.issueSession(user, ctx);
  }

  // ---------- Admin portal: OTP fallback (legacy / password recovery) ----------

  async sendPortalOtp(dto: SendOtpDto): Promise<SentOtpResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !isPortalRole(user.role)) {
      return { sent: true, cooldownSeconds: this.config.auth.otp.resendCooldownSeconds };
    }
    return this.otpService.sendOtp(dto.email);
  }

  async verifyPortalOtp(dto: VerifyOtpDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
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
  async issueSession(user: User, ctx: RequestContext): Promise<AuthResponseDto> {
    assertCanSignIn(user);

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
