import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { Role, UserStatus } from '#common/enums';
import { AppConfigService } from '#config';
import { AppLogger } from '#infra/logger';
import { UserRepository } from '../repositories/user.repository.js';

export type SuperAdminSeedResult = 'created' | 'promoted' | 'unchanged' | 'skipped';

/**
 * Ensures the account in SUPER_ADMIN_EMAIL exists and is a super admin. Runs on every boot and is
 * idempotent. This is the only way a portal account is created without an invite.
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
    const { email, name } = this.config.auth.superAdmin;
    if (!email) {
      this.logger.warn('SUPER_ADMIN_EMAIL is not set — no one can sign in to the admin portal yet', SuperAdminSeeder.name);
      return 'skipped';
    }

    const existing = await this.users.findByEmail(email);
    if (!existing) {
      await this.users.create({
        email,
        name,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        shopId: null,
        deletedAt: null,
        deletedBy: null,
      });
      this.logger.log(`Created super admin ${email}`, SuperAdminSeeder.name);
      return 'created';
    }

    if (existing.role === Role.SUPER_ADMIN && existing.status === UserStatus.ACTIVE) return 'unchanged';

    await this.users.updateById(existing._id, {
      $set: { role: Role.SUPER_ADMIN, status: UserStatus.ACTIVE, name: existing.name ?? name },
    });
    this.logger.warn(`Promoted ${email} (was ${existing.role}) to super admin`, SuperAdminSeeder.name);
    return 'promoted';
  }
}
