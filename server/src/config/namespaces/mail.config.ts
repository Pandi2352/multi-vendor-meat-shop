import { registerAs } from '@nestjs/config';
import { getEnv } from '../env.validation.js';

export const mailConfig = registerAs('mail', () => {
  const env = getEnv();
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.MAIL_FROM,
  };
});
