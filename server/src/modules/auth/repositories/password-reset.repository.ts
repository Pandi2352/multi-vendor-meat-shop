import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { generateId, sha256 } from '#common/utils';
import { BaseRepository } from '#database';
import { PasswordReset } from '../schemas/password-reset.schema.js';

export interface PasswordResetFields {
  tokenHash: string;
  expiresAt: Date;
  sentAt: Date;
}

@Injectable()
export class PasswordResetRepository extends BaseRepository<PasswordReset> {
  constructor(@InjectModel(PasswordReset.name) model: Model<PasswordReset>) {
    super(model, 'PasswordReset');
  }

  findByUserId(userId: string): Promise<PasswordReset | null> {
    return this.findOne({ userId });
  }

  /** Looks up by the raw emailed token (hashed here, never stored). */
  findByToken(rawToken: string): Promise<PasswordReset | null> {
    return this.findOne({ tokenHash: sha256(rawToken) });
  }

  /** Creates or replaces the user's single reset; a replaced token stops working. */
  async replaceForUser(userId: string, fields: PasswordResetFields): Promise<void> {
    await this.model
      .updateOne(
        { userId },
        { $set: { ...fields, usedAt: null }, $setOnInsert: { _id: generateId() } },
        { upsert: true, runValidators: true },
      )
      .exec();
  }

  /** Marks the reset used. False when another request already used it (double submit). */
  markUsed(id: string): Promise<boolean> {
    return this.updateOne({ _id: id, usedAt: null }, { $set: { usedAt: new Date() } });
  }
}
