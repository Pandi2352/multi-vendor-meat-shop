import { describe, expect, it, vi } from 'vitest';
import { Role, UserStatus } from '#common/enums';
import type { AppConfigService } from '#config';
import type { AppLogger } from '#infra/logger';
import type { UserRepository } from '../repositories/user.repository.js';
import { SuperAdminSeeder } from './super-admin-seeder.service.js';

const logger = { log: vi.fn(), warn: vi.fn() } as unknown as AppLogger;
const configWith = (email?: string) =>
  ({ auth: { superAdmin: { email, name: 'Owner' } } }) as unknown as AppConfigService;

const repoWith = (existing: unknown) => ({
  findByEmail: vi.fn().mockResolvedValue(existing),
  create: vi.fn().mockResolvedValue({}),
  updateById: vi.fn().mockResolvedValue({}),
});

const seed = (email: string | undefined, existing: unknown) => {
  const repo = repoWith(existing);
  const seeder = new SuperAdminSeeder(configWith(email), repo as unknown as UserRepository, logger);
  return { repo, result: seeder.seed() };
};

describe('SuperAdminSeeder', () => {
  it('skips when no email is configured', async () => {
    const { repo, result } = seed(undefined, null);
    await expect(result).resolves.toBe('skipped');
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  it('creates the super admin when missing', async () => {
    const { repo, result } = seed('owner@tnmeat.in', null);
    await expect(result).resolves.toBe('created');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'owner@tnmeat.in', role: Role.SUPER_ADMIN }));
  });

  it('leaves an existing active super admin alone', async () => {
    const { repo, result } = seed('owner@tnmeat.in', {
      _id: 'u1',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: 'existing_hash',
    });
    await expect(result).resolves.toBe('unchanged');
    expect(repo.updateById).not.toHaveBeenCalled();
  });

  it('promotes and reactivates an existing account', async () => {
    const { repo, result } = seed('owner@tnmeat.in', { _id: 'u1', role: Role.CUSTOMER, status: UserStatus.SUSPENDED });
    await expect(result).resolves.toBe('promoted');
    expect(repo.updateById).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        $set: expect.objectContaining({ role: Role.SUPER_ADMIN, status: UserStatus.ACTIVE, name: 'Owner' }),
      }),
    );
  });
});
