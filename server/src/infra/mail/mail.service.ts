import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppConfigService } from '#config';
import { AppLogger } from '#infra/logger';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(
    private readonly config: AppConfigService,
    private readonly logger: AppLogger,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.mail.host,
      port: this.config.mail.port,
      secure: this.config.mail.port === 465,
      auth: {
        user: this.config.mail.user,
        pass: this.config.mail.pass,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const subject = `Your Verification Code: ${otp}`;
    const text = `Hello,\n\nYour one-time verification code is: ${otp}\n\nThis code will expire in ${Math.round(this.config.auth.otp.ttlSeconds / 60)} minutes.\nIf you did not request this code, please ignore this email.\n\nBest regards,\n${this.config.app.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 6px; background-color: #ffffff;">
        <h2 style="color: #b91c1c; margin-top: 0;">Verification Code</h2>
        <p style="color: #1c1917; font-size: 15px; line-height: 1.5;">Please use the following one-time password (OTP) to log in to your account:</p>
        <div style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 6px; color: #1c1917;">
            ${otp}
          </span>
        </div>
        <p style="color: #57534e; font-size: 13px; line-height: 1.4;">
          This code expires in <strong>${Math.round(this.config.auth.otp.ttlSeconds / 60)} minutes</strong>. For your security, do not share this code with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;" />
        <p style="color: #a8a29e; font-size: 12px; margin-bottom: 0;">Sent by ${this.config.mail.from}</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.config.mail.from,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Sent OTP email to ${to}`, 'MailService');
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}: ${(error as Error).message}`, (error as Error).stack, 'MailService');
      throw error;
    }
  }
}
