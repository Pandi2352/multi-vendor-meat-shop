import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { Address, AddressSchema } from './schemas/address.schema.js';
import { UserRepository } from './repositories/user.repository.js';
import { AddressRepository } from './repositories/address.repository.js';
import { UsersService } from './services/users.service.js';
import { AddressesService } from './services/addresses.service.js';
import { UsersController } from './controllers/users.controller.js';
import { AddressesController } from './controllers/addresses.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  controllers: [UsersController, AddressesController],
  providers: [UserRepository, AddressRepository, UsersService, AddressesService],
  exports: [UsersService, AddressesService, AddressRepository],
})
export class UsersModule {}
