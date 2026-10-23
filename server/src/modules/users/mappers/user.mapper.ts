import type { User } from '../schemas/user.schema.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';

export const toUserResponseDto = (user: User): UserResponseDto => ({
  id: user._id,
  email: user.email,
  name: user.name ?? undefined,
  phone: user.phone ?? undefined,
  role: user.role,
  status: user.status,
  shopId: user.shopId ?? null,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
  updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt),
});
