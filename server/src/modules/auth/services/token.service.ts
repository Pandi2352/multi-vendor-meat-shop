import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AppConfigService } from '#config';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AuthUser } from '#common/interfaces';
import { ROLE_PERMISSIONS } from '#common/enums';

interface AccessTokenPayload {
  sub: string;
  role: string;
  shopId?: string | null;
}

interface RefreshTokenPayload {
  sub: string;
  sid: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly config: AppConfigService) {}

  signAccessToken(user: AuthUser): string {
    return jwt.sign(
      {
        sub: user.id,
        role: user.role,
        shopId: user.shopId ?? null,
      },
      this.config.auth.accessSecret,
      { expiresIn: this.config.auth.accessTtl as jwt.SignOptions['expiresIn'] },
    );
  }

  signRefreshToken(sessionId: string, userId: string): string {
    return jwt.sign(
      {
        sub: userId,
        sid: sessionId,
      },
      this.config.auth.refreshSecret,
      { expiresIn: this.config.auth.refreshTtl as jwt.SignOptions['expiresIn'] },
    );
  }

  verifyAccessToken(token: string): AuthUser {
    try {
      const decoded = jwt.verify(token, this.config.auth.accessSecret) as AccessTokenPayload;
      const role = decoded.role as AuthUser['role'];
      return {
        id: decoded.sub,
        role,
        permissions: ROLE_PERMISSIONS[role] ?? [],
        shopId: decoded.shopId ?? undefined,
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppException(ErrorCode.AUTH_TOKEN_EXPIRED);
      }
      throw new AppException(ErrorCode.AUTH_TOKEN_INVALID);
    }
  }

  verifyRefreshToken(token: string): { sub: string; sid: string } {
    try {
      const decoded = jwt.verify(token, this.config.auth.refreshSecret) as RefreshTokenPayload;
      return { sub: decoded.sub, sid: decoded.sid };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppException(ErrorCode.AUTH_TOKEN_EXPIRED);
      }
      throw new AppException(ErrorCode.AUTH_TOKEN_INVALID);
    }
  }
}
