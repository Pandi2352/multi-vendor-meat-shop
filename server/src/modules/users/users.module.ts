import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { Address, AddressSchema } from './schemas/address.schema.js';
import { UserInvitation, UserInvitationSchema } from './schemas/user-invitation.schema.js';
import { RolePermissionOverride, RolePermissionOverrideSchema } from './schemas/role-permission.schema.js';
import { UserRepository } from './repositories/user.repository.js';
import { AddressRepository } from './repositories/address.repository.js';
import { UserInvitationRepository } from './repositories/user-invitation.repository.js';
import { RolePermissionRepository } from './repositories/role-permission.repository.js';
import { UsersService } from './services/users.service.js';
import { AddressesService } from './services/addresses.service.js';
import { AdminUsersService } from './services/admin-users.service.js';
import { AdminRolesService } from './services/admin-roles.service.js';
import { InvitationsService } from './services/invitations.service.js';
import { ShopNameLookup } from './services/shop-name.lookup.js';
import { SuperAdminSeeder } from './services/super-admin-seeder.service.js';
import { VendorStaffService } from './services/vendor-staff.service.js';
import { UsersController } from './controllers/users.controller.js';
import { AddressesController } from './controllers/addresses.controller.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';
import { AdminRolesController } from './controllers/admin-roles.controller.js';
import { VendorStaffController } from './controllers/vendor-staff.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Address.name, schema: AddressSchema },
      { name: UserInvitation.name, schema: UserInvitationSchema },
      { name: RolePermissionOverride.name, schema: RolePermissionOverrideSchema },
    ]),
  ],
  controllers: [
    UsersController,
    AddressesController,
    AdminUsersController,
    AdminRolesController,
    VendorStaffController,
  ],
  providers: [
    UserRepository,
    AddressRepository,
    UserInvitationRepository,
    RolePermissionRepository,
    UsersService,
    AddressesService,
    AdminUsersService,
    AdminRolesService,
    VendorStaffService,
    SuperAdminSeeder,
    InvitationsService,
    ShopNameLookup,
  ],
  exports: [
    UsersService,
    AddressesService,
    AddressRepository,
    AdminUsersService,
    AdminRolesService,
    VendorStaffService,
    UserInvitationRepository,
    RolePermissionRepository,
    InvitationsService,
    ShopNameLookup,
  ],
})
export class UsersModule {}
