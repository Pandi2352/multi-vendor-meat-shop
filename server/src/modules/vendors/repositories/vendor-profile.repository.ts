import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { VendorProfile } from '../schemas/vendor-profile.schema.js';

@Injectable()
export class VendorProfileRepository extends BaseRepository<VendorProfile> {
  constructor(@InjectModel(VendorProfile.name) model: Model<VendorProfile>) {
    super(model, 'VendorProfile');
  }

  findByUserId(userId: string): Promise<VendorProfile | null> {
    return this.findOne({ userId });
  }
}
