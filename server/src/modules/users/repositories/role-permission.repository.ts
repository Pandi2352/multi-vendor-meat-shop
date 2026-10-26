import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Role } from '#common/enums';
import { RolePermissionOverride } from '../schemas/role-permission.schema.js';

@Injectable()
export class RolePermissionRepository extends BaseRepository<RolePermissionOverride> {
  constructor(@InjectModel(RolePermissionOverride.name) model: Model<RolePermissionOverride>) {
    super(model, 'RolePermissionOverride');
  }

  findByRole(role: Role): Promise<RolePermissionOverride | null> {
    return this.findOne({ role });
  }
}
