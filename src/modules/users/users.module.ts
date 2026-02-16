import { Module } from '@nestjs/common';
import { UserAuthService } from './services/user-auth.service';
import { UserAuthenticationRepository } from './repos/userAuthentication.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repos/user.repository';
import { UsersCrudController } from './controllers/users-crud.controller';
import { UsersCrudService } from './services/users-crud.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersCrudController],
  providers: [
    UserAuthService,
    UserAuthenticationRepository,
    UserRepository,
    UsersCrudService,
  ],
  exports: [UserAuthService, UserAuthenticationRepository, UserRepository],
})
export class UsersModule {}
