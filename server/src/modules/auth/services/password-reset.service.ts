import { Injectable } from '@nestjs/common';
import { ADMIN_APP_PATH } from '#common/constants';
import { UserStatus, isPortalRole } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import { hashPassword, randomToken, sha256 } from '#common/utils';
import { AppConfigService } from '#config';
import { MailService } from '#infra/mail';
import { UsersService, type User } from '#modules/users';
import type { AuthResponseDto, SentOtpResponseDto } from '../dto/auth-response.dto.js';
import type { PasswordResetDetailsResponseDto } from '../dto/password-reset-details-response.dto.js';
import type { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { PasswordResetRepository } from '../repositories/password-reset.repository.js';
import { RefreshSessionRepository } from '../repositories/refresh-session.repository.js';
import type { PasswordReset } from '../schemas/password-reset.schema.js';
import { AuthService, type RequestContext } from './auth.service.js';

export type ResetLinkProblem = 'invalid' | 'used' | 'expired';

const MINUTE_MS = 60_000;

/** Only active portal accounts can reset; customers sign in with codes, pending users use their invite. */
const canReset = (user: User | null): user is User =>
  !!user && isPortalRole(user.role) && user.status === UserStatus.ACTIVE;

const linkInvalid = (problem: ResetLinkProblem) =>
  new AppException(ErrorCode.RESET_LINK_INVALID, { details: { problem } });

/**
 * Forgot-password by email link. Requests always get the same answer, so the endpoint can't be
 * used to find out which emails have accounts. A reset signs the user out everywhere else.
 */
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly config: AppConfigService,
    private readonly resets: PasswordResetRepository,
    private readonly users: UsersService,
    private readonly sessions: RefreshSessionRepository,
    private readonly auth: AuthService,
    private readonly mail: MailService,
  ) {}

  async requestReset(email: string): Promise<SentOtpResponseDto> {
    const { ttlMinutes, cooldownSeconds } = this.config.auth.passwordReset;
    const answer = { sent: true, cooldownSeconds };

    const user = await this.users.findByEmail(email);
    if (!canReset(user)) return answer;

    const existing = await this.resets.findByUserId(user._id);
    const now = Date.now();
    if (existing && !existing.usedAt && now - existing.sentAt.getTime() < cooldownSeconds * 1000) return answer;

    const rawToken = randomToken(32);
    await this.resets.replaceForUser(user._id, {
      tokenHash: sha256(rawToken),
      expiresAt: new Date(now + ttlMinutes * MINUTE_MS),
      sentAt: new Date(now),
    });

    // Not awaited: the response time must not depend on whether the account exists.
    // MailService logs a failed send.
    this.mail
      .sendPasswordResetEmail(user.email, {
        name: user.name,
        resetUrl: `${this.config.app.adminAppUrl}${ADMIN_APP_PATH.RESET_PASSWORD}?token=${rawToken}`,
        ttlMinutes,
      })
      .catch(() => undefined);

    return answer;
  }

  async getDetails(rawToken: string): Promise<PasswordResetDetailsResponseDto> {
    const { reset, user } = await this.findUsable(rawToken);
    return { email: user.email, expiresAt: reset.expiresAt };
  }

  async resetPassword(dto: ResetPasswordDto, ctx: RequestContext = {}): Promise<AuthResponseDto> {
    const { reset, user } = await this.findUsable(dto.token);
    if (!(await this.resets.markUsed(reset._id))) throw linkInvalid('used');

    const updated = await this.users.updatePassword(user._id, hashPassword(dto.password));
    await this.sessions.revokeAllForUser(user._id);

    this.mail
      .sendPasswordChangedEmail(user.email, {
        name: user.name,
        changedAt: new Date(),
        forgotPasswordUrl: `${this.config.app.adminAppUrl}${ADMIN_APP_PATH.FORGOT_PASSWORD}`,
      })
      .catch(() => undefined);

    return this.auth.issueSession(updated, ctx);
  }

  private async findUsable(rawToken: string): Promise<{ reset: PasswordReset; user: User }> {
    const reset = rawToken ? await this.resets.findByToken(rawToken) : null;
    if (!reset) throw linkInvalid('invalid');
    if (reset.usedAt) throw linkInvalid('used');
    if (reset.expiresAt.getTime() <= Date.now()) throw linkInvalid('expired');

    // The account may have been suspended or removed since the email was sent.
    const user = await this.users.findById(reset.userId);
    if (!canReset(user)) throw linkInvalid('invalid');
    return { reset, user };
  }
}
