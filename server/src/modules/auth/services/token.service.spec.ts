import { describe, expect, it } from 'vitest';
import { Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppConfigService } from '#config';
import { TokenService } from './token.service.js';

const mockConfig = {
  auth: {
    accessSecret: '12345678901234567890123456789012',
    refreshSecret: 'abcdefghijklmnopqrstuvwxyz123456',
    accessTtl: '15m',
    refreshTtl: '30d',
  },
} as unknown as AppConfigService;

describe('TokenService', () => {
  const service = new TokenService(mockConfig);

  it('signs and verifies access token successfully', () => {
    const user = {
      id: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c',
      role: Role.CUSTOMER,
      permissions: [],
      shopId: undefined,
    };

    const token = service.signAccessToken(user);
    expect(typeof token).toBe('string');

    const decoded = service.verifyAccessToken(token);
    expect(decoded.id).toBe(user.id);
    expect(decoded.role).toBe(Role.CUSTOMER);
  });

  it('signs and verifies refresh token successfully', () => {
    const sessionId = '018f3a52-7b5c-7d92-881b-85fa7d7b5b5d';
    const userId = '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c';

    const token = service.signRefreshToken(sessionId, userId);
    expect(typeof token).toBe('string');

    const decoded = service.verifyRefreshToken(token);
    expect(decoded.sub).toBe(userId);
    expect(decoded.sid).toBe(sessionId);
  });

  it('throws AUTH_TOKEN_INVALID on invalid token', () => {
    expect(() => service.verifyAccessToken('invalid.token.here')).toThrow(AppException);
    try {
      service.verifyAccessToken('invalid.token.here');
    } catch (err) {
      expect((err as AppException).code).toBe(ErrorCode.AUTH_TOKEN_INVALID);
    }
  });
});
