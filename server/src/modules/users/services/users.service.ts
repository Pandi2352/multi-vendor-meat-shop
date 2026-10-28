import { Injectable } from '@nestjs/common';
import { NotFoundAppException } from '#common/exceptions';
import { Role, UserStatus } from '#common/enums';
import { UserRepository } from '../repositories/user.repository.js';
import type { User } from '../schemas/user.schema.js';
import type { UpdateUserDto } from '../dto/update-user.dto.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';
import { toUserResponseDto } from '../mappers/user.mapper.js';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundAppException('User', id);
    return user;
  }

  findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async getProfile(id: string): Promise<UserResponseDto> {
    const user = await this.findByIdOrThrow(id);
    return toUserResponseDto(user);
  }

  async findOrCreateByEmail(email: string, defaultRole: Role = Role.CUSTOMER): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;

    return this.userRepo.create({
      email: email.toLowerCase().trim(),
      role: defaultRole,
      shopId: null,
      status: UserStatus.ACTIVE,
      deletedAt: null,
      deletedBy: null,
    });
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findByIdOrThrow(id);
    const updated = await this.userRepo.updateByIdOrThrow(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
    });
    return toUserResponseDto(updated);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.userRepo.updateByIdOrThrow(id, { passwordHash });
  }

  async createOrActivateInvitedUser(data: {
    email: string;
    role: Role;
    name?: string;
    phone?: string;
    shopId?: string | null;
    dutyTitle?: string | null;
    passwordHash: string;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      return this.userRepo.updateByIdOrThrow(existing._id, {
        role: data.role,
        status: UserStatus.ACTIVE,
        passwordHash: data.passwordHash,
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        shopId: data.shopId !== undefined ? data.shopId : existing.shopId,
        ...(data.dutyTitle ? { dutyTitle: data.dutyTitle } : {}),
      });
    }

    return this.userRepo.create({
      email: data.email.toLowerCase().trim(),
      role: data.role,
      name: data.name,
      phone: data.phone,
      shopId: data.shopId ?? null,
      dutyTitle: data.dutyTitle ?? null,
      status: UserStatus.ACTIVE,
      passwordHash: data.passwordHash,
      deletedAt: null,
      deletedBy: null,
    });
  }
}

