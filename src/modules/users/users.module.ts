import { Module } from '@nestjs/common';
import { UserAuthService } from './services/user-auth.service';
import { UserAuthenticationRepository } from './repos/userAuthentication.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repos/user.repository';
import { UsersCrudController } from './controllers/users-crud.controller';
import { UsersCrudService } from './services/users-crud.service';
import { ProfileManagementService } from './services/profile-management.service';
import { ProfileManagementController } from './controllers/profile-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersCrudController, ProfileManagementController],
  providers: [
    UserAuthService,
    UserAuthenticationRepository,
    UserRepository,
    UsersCrudService,
    ProfileManagementService,
  ],
  exports: [UserAuthService, UserAuthenticationRepository, UserRepository],
})
export class UsersModule {}
