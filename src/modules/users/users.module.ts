import { Module } from '@nestjs/common';
import { UserAuthService } from './services/user-auth.service';
import { UserAuthenticationRepository } from './repos/userAuthentication.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UserAuthService, UserAuthenticationRepository],
  exports: [UserAuthService, UserAuthenticationRepository],
})
export class UsersModule {}
