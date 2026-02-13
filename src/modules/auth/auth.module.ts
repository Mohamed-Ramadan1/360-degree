import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserAuthService } from '../users/services/user-auth.service';
import { TokenCreationService } from './services/token-creation.service';
import { LoggerService } from 'src/logs/logger.service';
import { UsersModule } from '../users/users.module';
import { TokenValidationService } from './services/token-validation.service';
import { AccountRecoveryController } from './controllers/account-recovery.controller';
import { AccountRecoveryService } from './services/account-recovery.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController, AccountRecoveryController],
  providers: [
    AuthService,
    UserAuthService,
    TokenCreationService,
    LoggerService,
    TokenValidationService,
    AccountRecoveryService,
  ],
  exports: [TokenValidationService],
})
export class AuthModule {}
