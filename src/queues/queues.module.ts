import { Global, Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bullmq';

import {
  bullMQConfig,
  emailQueueConfig,
  resourceCleanupQueueConfig,
} from './config/bullmq.config';

import { EmailProcessor } from './processors/emails/email.processor';

import { EmailSenderService } from 'src/common/services/email-sender.service';
import { EmailQueueService } from './services/email-queue.service';
@Global()
@Module({
  imports: [
    BullModule.forRoot(bullMQConfig),
    BullModule.registerQueue(emailQueueConfig),
    // BullModule.registerQueue(resourceCleanupQueueConfig),
  ],

  providers: [EmailProcessor, EmailSenderService, EmailQueueService],
  exports: [EmailProcessor, BullModule, EmailQueueService],
})
export class QueuesModule {}
