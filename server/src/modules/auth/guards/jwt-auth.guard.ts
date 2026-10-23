import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEY } from '#common/constants';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppRequest } from '#common/interfaces';
import { TokenService } from '../services/token.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(METADATA_KEY.IS_PUBLIC, targets);

    const request = context.switchToHttp().getRequest<AppRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      if (isPublic) return true;
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      if (isPublic) return true;
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    try {
      request.user = this.tokenService.verifyAccessToken(token);
      return true;
    } catch (err) {
      if (isPublic) return true;
      throw err;
    }
  }
}
