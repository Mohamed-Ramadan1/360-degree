import { Injectable } from '@nestjs/common';
import { IUser } from '../interfaces/entities/user.interface';
import { LoggerService } from 'src/logs/logger.service';
import { UserRepository } from '../repos';
import { ResourceCleanupQueueService } from 'src/queues/services/resource-cleanup.service';

@Injectable()
export class ProfileManagementService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly resourceCleanupService: ResourceCleanupQueueService,
  ) {}

  async updateProfileImage(
    user: IUser,
    imageInfo: { imageUrl: string; imageLocation: string },
  ) {
    try {
      await this.userRepository.updateUserProfileImage(user.id, imageInfo);

      if (user.profileImageKey) {
        await this.resourceCleanupService.addCleanupTask({
          jobName: 'resource-cleanup',
          resourceKey: user.profileImageKey,
        });
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to update profile image for user ${user.id}: ${error.message}`,
        error,
      );
      throw error;
    }
  }
}
