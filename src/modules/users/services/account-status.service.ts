import { BadRequestException, Injectable } from '@nestjs/common';
// interfaces imports
import { IUser } from '../interfaces/index';
import { LoggerService } from 'src/logs/logger.service';

import { EmailQueueService } from 'src/queues/index';

import { generateAccountActivationEmail } from '../emails';

import { UserAccountStatusRepository } from '../repos';

@Injectable()
export class AccountStatusService {
  constructor(
    private readonly logger: LoggerService,
    private readonly accountStatusRepository: UserAccountStatusRepository,
    private readonly emailQueueService: EmailQueueService,
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Failed to activate account for userId: ${user.id}`,
        err,
      );
      throw err;
    }
  }

  private isActive(user: IUser): boolean {
    return user.isActive;
  }
}
