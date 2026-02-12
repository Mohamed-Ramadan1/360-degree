import { Global, Module } from '@nestjs/common';

import { EmailSenderService } from './services/email-sender.service';
import { VerificationTokensCreatorService } from './services/verification-tokens-creator.service';
import { RedisModule } from '.././infrastructure/redis/redis.module';
import { TokensTrackingService } from './services/tokens-tracking-service.service';
import { PasswordHelperService } from './services/password-helper.service';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    EmailSenderService,
    VerificationTokensCreatorService,
    TokensTrackingService,
    PasswordHelperService,
  ],
  exports: [
    EmailSenderService,
    VerificationTokensCreatorService,
    TokensTrackingService,
    PasswordHelperService,
  ],
})
export class CommonModule {}
