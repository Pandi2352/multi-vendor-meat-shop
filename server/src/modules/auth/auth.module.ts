import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '#modules/users';
import { MailModule } from '#infra/mail';
import { OtpChallenge, OtpChallengeSchema } from './schemas/otp-challenge.schema.js';
import { RefreshSession, RefreshSessionSchema } from './schemas/refresh-session.schema.js';
import { PasswordReset, PasswordResetSchema } from './schemas/password-reset.schema.js';
import { OtpChallengeRepository } from './repositories/otp-challenge.repository.js';
import { RefreshSessionRepository } from './repositories/refresh-session.repository.js';
import { PasswordResetRepository } from './repositories/password-reset.repository.js';
import { TokenService } from './services/token.service.js';
import { OtpService } from './services/otp.service.js';
import { AuthService } from './services/auth.service.js';
import { PasswordResetService } from './services/password-reset.service.js';
import { SessionUserService } from './services/session-user.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthController } from './controllers/auth.controller.js';
import { PortalAuthController } from './controllers/portal-auth.controller.js';
import { PortalPasswordController } from './controllers/portal-password.controller.js';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtpChallenge.name, schema: OtpChallengeSchema },
      { name: RefreshSession.name, schema: RefreshSessionSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
    ]),
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController, PortalAuthController, PortalPasswordController],
  providers: [
    OtpChallengeRepository,
    RefreshSessionRepository,
    PasswordResetRepository,
    TokenService,
    OtpService,
    AuthService,
    PasswordResetService,
    SessionUserService,
    JwtAuthGuard,
  ],
  exports: [TokenService, AuthService, SessionUserService, JwtAuthGuard],
})
export class AuthModule {}
