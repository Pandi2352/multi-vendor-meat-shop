import { describe, expect, it, vi } from 'vitest';
import { AppException, ErrorCode } from '#common/exceptions';
import { sha256 } from '#common/utils';
import type { AppConfigService } from '#config';
import type { MailService } from '#infra/mail';
import type { OtpChallengeRepository } from '../repositories/otp-challenge.repository.js';
import { OtpService } from './otp.service.js';

describe('OtpService', () => {
  const mockConfig = {
    auth: {
      otp: {
        length: 6,
        ttlSeconds: 300,
        maxAttempts: 3,
        resendCooldownSeconds: 60,
      },
    },
  } as unknown as AppConfigService;

  const mockMail = {
    sendOtpEmail: vi.fn().mockResolvedValue(undefined),
  } as unknown as MailService;

  it('generates OTP, stores hash, and triggers email', async () => {
    const mockRepo = {
      findLatestForEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ _id: 'otp-id' }),
    } as unknown as OtpChallengeRepository;

    const service = new OtpService(mockConfig, mockRepo, mockMail);
    const result = await service.sendOtp('test@example.com');

    expect(result.sent).toBe(true);
    expect(result.cooldownSeconds).toBe(60);
    expect(mockMail.sendOtpEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
  });

  it('enforces resend cooldown', async () => {
    const mockRepo = {
      findLatestForEmail: vi.fn().mockResolvedValue({
        verified: false,
        resendAvailableAt: new Date(Date.now() + 30 * 1000), // 30s in future
      }),
    } as unknown as OtpChallengeRepository;

    const service = new OtpService(mockConfig, mockRepo, mockMail);
    await expect(service.sendOtp('test@example.com')).rejects.toThrow(AppException);
  });

  it('verifies valid OTP correctly', async () => {
    const rawOtp = '123456';
    const mockRepo = {
      findLatestForEmail: vi.fn().mockResolvedValue({
        _id: 'otp-id',
        otpHash: sha256(rawOtp),
        verified: false,
        expiresAt: new Date(Date.now() + 100 * 1000),
        attempts: 0,
      }),
      updateById: vi.fn().mockResolvedValue({}),
    } as unknown as OtpChallengeRepository;

    const service = new OtpService(mockConfig, mockRepo, mockMail);
    const verified = await service.verifyOtp('test@example.com', rawOtp);

    expect(verified).toBe(true);
    expect(mockRepo.updateById).toHaveBeenCalledWith('otp-id', { verified: true });
  });

  it('rejects invalid OTP and increments attempts', async () => {
    const mockRepo = {
      findLatestForEmail: vi.fn().mockResolvedValue({
        _id: 'otp-id',
        otpHash: sha256('123456'),
        verified: false,
        expiresAt: new Date(Date.now() + 100 * 1000),
        attempts: 0,
      }),
      updateById: vi.fn().mockResolvedValue({}),
    } as unknown as OtpChallengeRepository;

    const service = new OtpService(mockConfig, mockRepo, mockMail);
    await expect(service.verifyOtp('test@example.com', '654321')).rejects.toThrow(AppException);
    expect(mockRepo.updateById).toHaveBeenCalledWith('otp-id', { $inc: { attempts: 1 } });
  });
});
