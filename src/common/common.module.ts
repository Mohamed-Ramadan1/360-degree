import { Global, Module } from '@nestjs/common';

import { EmailSenderService } from './services/email-sender.service';
import { VerificationTokensCreatorService } from './services/verification-tokens-creator.service';
import { RedisModule } from '.././infrastructure/redis/redis.module';
import { TokensTrackingService } from './services/tokens-tracking-service.service';
import { PasswordHelperService } from './services/password-helper.service';
import { ResourceCleanupService } from './services/resource-cleanup.service';
import { OtpService } from './services/otp.service';
import { SmsSenderService } from './services/sms-sender.service';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    EmailSenderService,
    VerificationTokensCreatorService,
    TokensTrackingService,
    PasswordHelperService,
    ResourceCleanupService,
    OtpService,
    SmsSenderService,
  ],
  exports: [
    EmailSenderService,
    VerificationTokensCreatorService,
    TokensTrackingService,
    PasswordHelperService,
    ResourceCleanupService,
    OtpService,
    SmsSenderService,
  ],
})
export class CommonModule {}
