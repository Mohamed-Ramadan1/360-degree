import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserAuthService } from '../users/services/user-auth.service';
import { TokenCreationService } from './services/token-creation.service';
import { LoggerService } from 'src/logs/logger.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserAuthService,
    TokenCreationService,
    LoggerService,
  ],
})
export class AuthModule {}
