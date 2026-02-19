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
import { ResourceCleanupQueueService } from './services/resource-cleanup.service';
import { ResourceCleanupService } from 'src/common/services/resource-cleanup.service';
import { ResourceCleanupProcessor } from './processors/resourceCleanup/resource-cleanup.processor';
@Global()
@Module({
  imports: [
    BullModule.forRoot(bullMQConfig),
    BullModule.registerQueue(emailQueueConfig),
    BullModule.registerQueue(resourceCleanupQueueConfig),
  ],

  providers: [
    EmailProcessor,
    EmailSenderService,
    EmailQueueService,
    ResourceCleanupProcessor,
    ResourceCleanupService,
    ResourceCleanupQueueService,
  ],
  exports: [
    EmailProcessor,
    EmailQueueService,
    BullModule,
    ResourceCleanupProcessor,
    ResourceCleanupQueueService,
  ],
})
export class QueuesModule {}
