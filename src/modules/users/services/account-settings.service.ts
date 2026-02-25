import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';

import { IUser } from '../interfaces';
import { UserSettingsRepository } from '../repos';

@Injectable()
export class AccountSettingsService {
  constructor(
    private readonly logger: LoggerService,

    private readonly userSettingsRepository: UserSettingsRepository,
  ) {}

  async acceptTerms(user: IUser): Promise<void> {
    if (user.termsAccepted) {
      return;
    }
    try {
      await this.userSettingsRepository.acceptTerms(user.id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to accept terms for user ${user.id}: ${error.message}`,
      );
      throw error;
    }
  }
}
