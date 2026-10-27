import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { maskEmail } from '#common/utils';
import { AppConfigService } from '#config';
import { AppLogger } from '#infra/logger';
import type { EmailMessage } from './templates/email-layout.js';
import { invitationEmail, type InvitationEmailData } from './templates/invitation.template.js';
import { otpEmail } from './templates/otp.template.js';
import { passwordChangedEmail, type PasswordChangedEmailData } from './templates/password-changed.template.js';
import { passwordResetEmail, type PasswordResetEmailData } from './templates/password-reset.template.js';

/**
 * Transactional email. `MAIL_DRIVER=smtp` sends through SMTP; `MAIL_DRIVER=log` writes the
 * message (including links) to the server log instead, for local testing without real mail.
 */
@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: AppLogger,
  ) {
    this.transporter =
      this.config.mail.driver === 'smtp'
        ? nodemailer.createTransport({
            host: this.config.mail.host,
            port: this.config.mail.port,
            secure: this.config.mail.port === 465,
            auth: { user: this.config.mail.user, pass: this.config.mail.pass },
          })
        : null;
  }

  sendOtpEmail(to: string, otp: string): Promise<void> {
    const message = otpEmail({
      otp,
      ttlMinutes: Math.round(this.config.auth.otp.ttlSeconds / 60),
      appName: this.config.app.displayName,
      from: this.config.mail.from,
    });
    return this.deliver(to, message, 'OTP');
  }

  sendInvitationEmail(to: string, data: Omit<InvitationEmailData, 'appName'>): Promise<void> {
    return this.deliver(to, invitationEmail({ ...data, appName: this.config.app.displayName }), 'invitation');
  }

  sendPasswordResetEmail(to: string, data: Omit<PasswordResetEmailData, 'appName'>): Promise<void> {
    return this.deliver(to, passwordResetEmail({ ...data, appName: this.config.app.displayName }), 'password reset');
  }

  sendPasswordChangedEmail(to: string, data: Omit<PasswordChangedEmailData, 'appName'>): Promise<void> {
    return this.deliver(to, passwordChangedEmail({ ...data, appName: this.config.app.displayName }), 'password changed');
  }

  private async deliver(to: string, message: EmailMessage, kind: string): Promise<void> {
    if (!this.transporter) {
      // Log driver: the full text is printed so developers can open links locally.
      this.logger.log(`[mail:log] ${kind} → ${to}\nSubject: ${message.subject}\n${message.text}`, MailService.name);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.config.mail.from, to, ...message });
      this.logger.log(`Sent ${kind} email to ${maskEmail(to)}`, MailService.name);
    } catch (error) {
      this.logger.error(
        `Failed to send ${kind} email to ${maskEmail(to)}: ${(error as Error).message}`,
        (error as Error).stack,
        MailService.name,
      );
      throw error;
    }
  }
}
