import { Injectable } from '@nestjs/common';
import { UserRoles } from 'src/common/consts';
import { LoggerService } from 'src/logs/logger.service';
import { EmailQueueService } from 'src/queues/services/email-queue.service';
import { UserRolesRepository } from '../repos';
import { generateNewRolesAddedEmail } from '../emails/generateNewRolesAddedEmail';

@Injectable()
export class RolesManagementService {
  constructor(
    private readonly userRolesRepository: UserRolesRepository,
    private readonly emailQueueService: EmailQueueService,
    private readonly logger: LoggerService,
  ) {}

  async assignRoles(userId: string, roles: UserRoles[]): Promise<void> {
    try {
      const { user, addedRoles, isModified } =
        await this.userRolesRepository.assignRoles(userId, roles);

      if (!isModified || addedRoles.length === 0) {
        this.logger.log(
          `No new roles were added to user ${userId}. Current roles: ${user.roles.join(
            ', ',
          )}`,
        );
        return;
      }

      // send email logic gon be here
      await this.emailQueueService.addEmailJob({
        type: 'new-roles-assigned',
        to: user.email,
        subject: 'New Roles Assigned',
        text: 'You have been assigned new roles!',
        html: generateNewRolesAddedEmail({
          userName: user.name,
          addedRoles: addedRoles,
        }),
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error assigning roles to user ${userId}: ${err.message}`,
        err,
      );

      throw err;
    }
  }
}
