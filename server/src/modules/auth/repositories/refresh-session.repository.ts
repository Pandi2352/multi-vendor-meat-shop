import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { RefreshSession } from '../schemas/refresh-session.schema.js';

@Injectable()
export class RefreshSessionRepository extends BaseRepository<RefreshSession> {
  constructor(@InjectModel(RefreshSession.name) model: Model<RefreshSession>) {
    super(model, 'RefreshSession');
  }

  findActiveSession(sessionId: string): Promise<RefreshSession | null> {
    return this.findOne({ _id: sessionId, revoked: false });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.model.updateMany({ userId }, { revoked: true }).exec();
  }
}
