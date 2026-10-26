import { registerAs } from '@nestjs/config';
import { getEnv } from '../env.validation.js';

export const authConfig = registerAs('auth', () => {
  const env = getEnv();
  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.JWT_ACCESS_TTL,
    refreshTtl: env.JWT_REFRESH_TTL,
    otp: {
      length: env.OTP_LENGTH,
      ttlSeconds: env.OTP_TTL_SECONDS,
      maxAttempts: env.OTP_MAX_ATTEMPTS,
      resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
    },
    superAdmin: {
      email: env.SUPER_ADMIN_EMAIL?.trim().toLowerCase(),
      name: env.SUPER_ADMIN_NAME,
      password: env.SUPER_ADMIN_PASSWORD || 'Admin@12345',
    },
  };
});
