import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { Role, UserStatus } from '#common/enums';
import { hashPassword } from '#common/utils';
import { AppConfigService } from '#config';
import { AppLogger } from '#infra/logger';
import { UserRepository } from '../repositories/user.repository.js';

export type SuperAdminSeedResult = 'created' | 'promoted' | 'unchanged' | 'skipped';

/**
 * Ensures the account in SUPER_ADMIN_EMAIL exists and is a super admin with an active password.
 * Runs on every boot and is idempotent.
 */
@Injectable()
export class SuperAdminSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly config: AppConfigService,
    private readonly users: UserRepository,
    private readonly logger: AppLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<SuperAdminSeedResult> {
    const { email, name, password } = this.config.auth.superAdmin;
    if (!email) {
      this.logger.warn('SUPER_ADMIN_EMAIL is not set — no one can sign in to the admin portal yet', SuperAdminSeeder.name);
      return 'skipped';
    }

    const passwordHash = hashPassword(password || 'Admin@12345');
    const existing = await this.users.findByEmail(email);

    if (!existing) {
      await this.users.create({
        email,
        name,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        shopId: null,
        passwordHash,
        deletedAt: null,
        deletedBy: null,
      });
      this.logger.log(`Created super admin ${email} with password`, SuperAdminSeeder.name);
      return 'created';
    }

    if (existing.role === Role.SUPER_ADMIN && existing.status === UserStatus.ACTIVE && existing.passwordHash) {
      return 'unchanged';
    }

    await this.users.updateById(existing._id, {
      $set: {
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        name: existing.name ?? name,
        passwordHash: existing.passwordHash || passwordHash,
      },
    });
    this.logger.warn(`Updated super admin ${email}`, SuperAdminSeeder.name);
    return 'promoted';
  }
}
