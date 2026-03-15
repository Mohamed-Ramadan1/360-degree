import { Global, Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bullmq';

import {
  bullMQConfig,
  emailQueueConfig,
  habitQueueConfig,
  reminderQueueConfig,
  resourceCleanupQueueConfig,
  smsQueueConfig,
} from './config/bullmq.config';

import { EmailProcessor } from './processors/emails/email.processor';

import { EmailSenderService } from 'src/common/services/email-sender.service';
import { EmailQueueService } from './services/email-queue.service';
import { ResourceCleanupQueueService } from './services/resource-cleanup.service';
import { ResourceCleanupService } from 'src/common/services/resource-cleanup.service';
import { ResourceCleanupProcessor } from './processors/resourceCleanup/resource-cleanup.processor';
import { SmsQueueService } from './services/sms-queue.service';
import { SmsProcessor } from './processors/sms/sms.processor';
import { ReminderQueueService } from './services/reminder-queue.service';
import { ReminderProcessor } from './processors/reminders/reminder.processor';
import { HabitsModule, TodosModule } from 'src/modules';
import { HabitQueueService } from './services/habit-queu.service';
import { HabitProcessor } from './processors/habits/habit.processor';
@Global()
@Module({
  imports: [
    BullModule.forRoot(bullMQConfig),
    BullModule.registerQueue(emailQueueConfig),
    BullModule.registerQueue(resourceCleanupQueueConfig),
    BullModule.registerQueue(smsQueueConfig),
    BullModule.registerQueue(reminderQueueConfig),
    BullModule.registerQueue(habitQueueConfig),
    TodosModule,
    HabitsModule,
  ],

  providers: [
    EmailProcessor,
    EmailSenderService,
    EmailQueueService,
    ResourceCleanupProcessor,
    ResourceCleanupService,
    ResourceCleanupQueueService,
    SmsProcessor,
    SmsQueueService,
    ReminderQueueService,
    ReminderProcessor,
    HabitQueueService,
    HabitProcessor,
  ],
  exports: [
    EmailProcessor,
    EmailQueueService,
    BullModule,
    ResourceCleanupProcessor,
    ResourceCleanupQueueService,
    SmsProcessor,
    SmsQueueService,
    ReminderQueueService,
    HabitQueueService,
  ],
})
export class QueuesModule {}
