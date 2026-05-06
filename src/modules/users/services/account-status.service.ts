import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from 'src/modules/notifications/events/names/notification-events.constants';
import { NotificationSourceType } from 'src/common/consts';
// interfaces imports
import { IAccountStatusService, IUser } from '../interfaces/index';
import { LoggerService } from 'src/logs/logger.service';

import { EmailQueueService } from 'src/queues/index';

import {
  generateAccountActivationEmail,
  generateAccountDeactivationEmail,
} from '../emails';

import { UserAccountStatusRepository } from '../repos';

@Injectable()
export class AccountStatusService implements IAccountStatusService {
  constructor(
    private readonly logger: LoggerService,
    private readonly accountStatusRepository: UserAccountStatusRepository,
    private readonly emailQueueService: EmailQueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async activateAccount(user: IUser): Promise<void> {
    const isActive = this.isActive(user);
    if (isActive) {
      throw new BadRequestException('Account is already activated');
    }
    try {
      const result = await this.accountStatusRepository.markAccountAsActive(
        user.id,
      );
      if (result.affected === 0) {
        throw new Error('Failed to activate account');
      }

      await this.emailQueueService.addEmailJob({
        type: 'send-activation-email',
        to: user.email,
        subject: 'Account Activated',
        text: 'Your account has been activated.',
        html: generateAccountActivationEmail({
          user: user,
          activationDate: new Date(),
        }),
      });

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: user.id,
        title: 'Account Activated',
        body: 'Your account has been activated.',
        sourceType: NotificationSourceType.SYSTEM,
        sourceId: user.id,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Failed to activate account for userId: ${user.id}`,
        err,
      );
      throw err;
    }
  }

  async deactivateAccount(user: IUser): Promise<void> {
    const isActive = this.isActive(user);
    if (!isActive) {
      throw new BadRequestException('Account is already deactivated');
    }
    try {
      const result = await this.accountStatusRepository.markAccountAsInactive(
        user.id,
      );
      if (result.affected === 0) {
        throw new Error('Failed to deactivate account');
      }

      await this.emailQueueService.addEmailJob({
        type: 'send-deactivation-email',
        to: user.email,
        subject: 'Account Deactivated',
        text: 'Your account has been deactivated.',
        html: generateAccountDeactivationEmail({
          user: user,
          deactivationDate: new Date(),
        }),
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Failed to deactivate account for userId: ${user.id}`,
        err,
      );
      throw err;
    }
  }

  private isActive(user: IUser): boolean {
    return user.isActive;
  }
}
