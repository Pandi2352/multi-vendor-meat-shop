import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { UserInvitation } from '../schemas/user-invitation.schema.js';

@Injectable()
export class UserInvitationRepository extends BaseRepository<UserInvitation> {
  constructor(@InjectModel(UserInvitation.name) model: Model<UserInvitation>) {
    super(model, 'UserInvitation');
  }

  findByEmail(email: string): Promise<UserInvitation | null> {
    return this.findOne({ email: email.toLowerCase().trim() });
  }

  findByToken(token: string): Promise<UserInvitation | null> {
    return this.findOne({ token });
  }
}
