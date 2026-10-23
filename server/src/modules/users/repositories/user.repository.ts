import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { User } from '../schemas/user.schema.js';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model, 'User');
  }

  findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase().trim() });
  }
}
