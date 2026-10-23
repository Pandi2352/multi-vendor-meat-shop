import { Injectable } from '@nestjs/common';
import { AppConfigService } from '#config';
import { AppException, ErrorCode } from '#common/exceptions';
import { generateOtp, safeCompare, sha256 } from '#common/utils';
import { MailService } from '#infra/mail';
import { OtpChallengeRepository } from '../repositories/otp-challenge.repository.js';
import type { SentOtpResponseDto } from '../dto/auth-response.dto.js';

@Injectable()
export class OtpService {
  constructor(
    private readonly config: AppConfigService,
    private readonly otpRepo: OtpChallengeRepository,
    private readonly mail: MailService,
  ) {}

  async sendOtp(email: string): Promise<SentOtpResponseDto> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.otpRepo.findLatestForEmail(normalizedEmail);

    const now = new Date();
    if (existing && !existing.verified && existing.resendAvailableAt > now) {
      const waitSeconds = Math.ceil((existing.resendAvailableAt.getTime() - now.getTime()) / 1000);
      throw new AppException(ErrorCode.TOO_MANY_REQUESTS, {
        message: `Please wait ${waitSeconds}s before requesting a new OTP.`,
      });
    }

    const otp = generateOtp(this.config.auth.otp.length);
    const otpHash = sha256(otp);
    const expiresAt = new Date(now.getTime() + this.config.auth.otp.ttlSeconds * 1000);
    const resendAvailableAt = new Date(
      now.getTime() + this.config.auth.otp.resendCooldownSeconds * 1000,
    );

    await this.otpRepo.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      verified: false,
    });

    await this.mail.sendOtpEmail(normalizedEmail, otp);

    return {
      sent: true,
      cooldownSeconds: this.config.auth.otp.resendCooldownSeconds,
    };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const challenge = await this.otpRepo.findLatestForEmail(normalizedEmail);

    if (!challenge || challenge.verified) {
      throw new AppException(ErrorCode.OTP_INVALID);
    }

    const now = new Date();
    if (challenge.expiresAt < now) {
      throw new AppException(ErrorCode.OTP_EXPIRED);
    }

    if (challenge.attempts >= this.config.auth.otp.maxAttempts) {
      throw new AppException(ErrorCode.OTP_TOO_MANY_ATTEMPTS);
    }

    const inputHash = sha256(otp);
    const isMatch = safeCompare(challenge.otpHash, inputHash);

    if (!isMatch) {
      await this.otpRepo.updateById(challenge._id, { $inc: { attempts: 1 } });
      throw new AppException(ErrorCode.OTP_INVALID);
    }

    await this.otpRepo.updateById(challenge._id, { verified: true });
    return true;
  }
}
