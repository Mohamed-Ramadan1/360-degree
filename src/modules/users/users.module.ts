import { Module } from '@nestjs/common';
import { UserAuthService } from './services/user-auth.service';
import {
  UserAccountStatusRepository,
  UserAuthenticationRepository,
  UserRepository,
  UserRolesRepository,
  UserSettingsRepository,
} from './repos';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersCrudController } from './controllers/users-crud.controller';
import { UsersCrudService } from './services/users-crud.service';
import { ProfileManagementService } from './services/profile-management.service';
import { ProfileManagementController } from './controllers/profile-management.controller';
import { RolesManagementService } from './services/roles-management.service';
import { RolesManagementController } from './controllers/roles-management.controller';
import { AccountStatusController } from './controllers/account-status.controller';
import { AccountStatusService } from './services/account-status.service';
import { AccountSettingsController } from './controllers/account-settings.controller';
import { AccountSettingsService } from './services/account-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [
    UsersCrudController,
    ProfileManagementController,
    RolesManagementController,
    AccountStatusController,
    AccountSettingsController,
  ],
  providers: [
    UserAuthService,
    UserAuthenticationRepository,
    UserRepository,
    UserRolesRepository,
    UserSettingsRepository,
    AccountSettingsService,
    UserAccountStatusRepository,
    UsersCrudService,
    ProfileManagementService,
    RolesManagementService,
    AccountStatusService,
  ],
  exports: [UserAuthService, UserAuthenticationRepository, UserRepository],
})
export class UsersModule {}
