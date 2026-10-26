import { describe, expect, it } from 'vitest';
import { NodeEnv, validateEnv } from './env.validation.js';

const REQUIRED = {
  MONGODB_URI: 'mongodb://localhost:27017/meat_shop',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  SMTP_USER: 'test@example.com',
  SMTP_PASS: 'testpass123',
  MAIL_FROM: 'noreply@example.com',
};

describe('validateEnv', () => {
  it('applies defaults and converts types', () => {
    const env = validateEnv({ ...REQUIRED, PORT: '5000', SWAGGER_ENABLED: 'false' });
    expect(env.NODE_ENV).toBe(NodeEnv.DEVELOPMENT);
    expect(env.PORT).toBe(5000);
    expect(env.SWAGGER_ENABLED).toBe(false);
    expect(env.DEFAULT_COMMISSION_BPS).toBe(1000);
  });

  it('lists every problem in one error', () => {
    expect(() => validateEnv({ MONGODB_URI: 'postgres://x', JWT_ACCESS_SECRET: 'short' })).toThrow(
      /MONGODB_URI must be a mongodb[\s\S]*JWT_ACCESS_SECRET[\s\S]*JWT_REFRESH_SECRET/,
    );
  });

  it('rejects bad booleans and numbers', () => {
    expect(() => validateEnv({ ...REQUIRED, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...REQUIRED, LOG_PRETTY: 'yes' })).toThrow(/LOG_PRETTY/);
  });
});
