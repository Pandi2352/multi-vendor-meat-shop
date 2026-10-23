import { describe, expect, it, vi } from 'vitest';
import { Role, UserStatus } from '#common/enums';
import { NotFoundAppException } from '#common/exceptions';
import type { UserRepository } from '../repositories/user.repository.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const dummyUser = {
    _id: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c',
    email: 'test@example.com',
    role: Role.CUSTOMER,
    status: UserStatus.ACTIVE,
    shopId: null,
    createdAt: new Date('2026-10-23T12:00:00.000Z'),
    updatedAt: new Date('2026-10-23T12:00:00.000Z'),
  };

  it('gets profile of existing user', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(dummyUser),
    } as unknown as UserRepository;

    const service = new UsersService(mockRepo);
    const profile = await service.getProfile(dummyUser._id);

    expect(profile.id).toBe(dummyUser._id);
    expect(profile.email).toBe(dummyUser.email);
    expect(profile.role).toBe(Role.CUSTOMER);
  });

  it('throws NotFoundAppException if user not found', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as UserRepository;

    const service = new UsersService(mockRepo);
    await expect(service.getProfile('non-existent')).rejects.toThrow();
  });

  it('creates new user if email not registered', async () => {
    const mockRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(dummyUser),
    } as unknown as UserRepository;

    const service = new UsersService(mockRepo);
    const user = await service.findOrCreateByEmail('test@example.com');

    expect(user.email).toBe('test@example.com');
    expect(mockRepo.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      role: Role.CUSTOMER,
      shopId: null,
      status: UserStatus.ACTIVE,
      deletedAt: null,
      deletedBy: null,
    });
  });
});
