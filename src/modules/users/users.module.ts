import { Module } from '@nestjs/common';
import { UserAuthService } from './services/user-auth.service';
import { UserAuthenticationRepository } from './repos/userAuthentication.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repos/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UserAuthService, UserAuthenticationRepository, UserRepository],
  exports: [UserAuthService, UserAuthenticationRepository, UserRepository],
})
export class UsersModule {}
