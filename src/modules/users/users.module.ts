import { Module } from '@nestjs/common';
import { UserAuthService } from './services/user-auth.service';
import {
  UserAuthenticationRepository,
  UserRepository,
  UserRolesRepository,
} from './repos';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersCrudController } from './controllers/users-crud.controller';
import { UsersCrudService } from './services/users-crud.service';
import { ProfileManagementService } from './services/profile-management.service';
import { ProfileManagementController } from './controllers/profile-management.controller';
import { RolesManagementService } from './services/roles-management.service';
import { RolesManagementController } from './controllers/roles-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [
    UsersCrudController,
    ProfileManagementController,
    RolesManagementController,
  ],
  providers: [
    UserAuthService,
    UserAuthenticationRepository,
    UserRepository,
    UserRolesRepository,
    UsersCrudService,
    ProfileManagementService,
    RolesManagementService,
  ],
  exports: [UserAuthService, UserAuthenticationRepository, UserRepository],
})
export class UsersModule {}
