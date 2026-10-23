import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { OtpChallenge } from '../schemas/otp-challenge.schema.js';

@Injectable()
export class OtpChallengeRepository extends BaseRepository<OtpChallenge> {
  constructor(@InjectModel(OtpChallenge.name) model: Model<OtpChallenge>) {
    super(model, 'OtpChallenge');
  }

  async findLatestForEmail(email: string): Promise<OtpChallenge | null> {
    const list = await this.findMany(
      { email: email.toLowerCase().trim() },
      { sort: { createdAt: -1 }, limit: 1 },
    );
    return list[0] ?? null;
  }
}
