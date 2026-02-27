import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRoles } from 'src/common/consts';
import { LoggerService } from 'src/logs/logger.service';
import { EmailQueueService } from 'src/queues/services/email-queue.service';
import { UserRolesRepository } from '../repos';
import { generateNewRolesAddedEmail } from '../emails/generateNewRolesAddedEmail';
import { generateRolesRemovedEmail } from '../emails/generateNewRolesRemovedEmail';
import { IRolesManagementService } from '../interfaces';

@Injectable()
export class RolesManagementService implements IRolesManagementService {
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

  async removeRoles(userId: string, roles: UserRoles[]): Promise<void> {
    try {
      const { user, isModified } = await this.userRolesRepository.removeRoles(
        userId,
        roles,
      );

      if (!isModified) {
        this.logger.log(
          `No roles were removed from user ${userId}. Current roles: ${user.roles.join(
            ', ',
          )}`,
        );

        throw new BadRequestException(
          'No roles were removed from the user. User missing the role or you trying to remove the user role.',
        );
      }

      // send email logic gon be here
      await this.emailQueueService.addEmailJob({
        type: 'roles-removed',
        to: user.email,
        subject: 'Roles Removed',
        text: 'Your roles have been removed!',
        html: generateRolesRemovedEmail({
          userName: user.name,
          removedRoles: roles,
        }),
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error removing roles from user ${userId}: ${err.message}`,
        err,
      );
      throw err;
    }
  }

  async resetRoles(userId: string): Promise<void> {
    try {
      await this.userRolesRepository.resetRoles(userId);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error resetting roles for user ${userId}: ${err.message}`,
        err,
      );
      throw err;
    }
  }

  async bulkAssignRoles(
    userIds: string[],
    roles: UserRoles[],
  ): Promise<{
    success: boolean;
    updated: number;
    skipped: number;
    details: {
      updatedUserIds: string[];
      skippedUserIds: string[];
    };
  }> {
    try {
      const { success, updated, skipped, details } =
        await this.userRolesRepository.bulkAssignRoles(userIds, roles);

      if (!success) {
        this.logger.log(
          `No roles were assigned to the provided users: ${userIds.join(', ')}`,
        );
        return { success, updated, skipped, details };
      }

      this.logger.log(
        `Successfully assigned roles to users: ${userIds.join(', ')}`,
      );
      return { success, updated, skipped, details };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error assigning roles to users: ${err.message}`, err);
      throw err;
    }
  }

  async bulkRemoveRoles(
    userIds: string[],
    roles: UserRoles[],
  ): Promise<{
    success: boolean;
    updated: number;
    notFound: string[];
  }> {
    try {
      const { success, notFound, updated } =
        await this.userRolesRepository.bulkRemoveRoles(userIds, roles);

      if (!success) {
        this.logger.log(
          `No roles were removed from the provided users: ${userIds.join(
            ', ',
          )}`,
        );
        return { success, notFound, updated };
      }

      this.logger.log(
        `Successfully removed roles from users: ${userIds.join(', ')}`,
      );
      return { success, notFound, updated };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error removing roles for users: ${err.message}`, err);
      throw err;
    }
  }

  async getUserRoles(userId: string): Promise<UserRoles[]> {
    try {
      const roles: UserRoles[] =
        await this.userRolesRepository.getUserRoles(userId);

      return roles;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Error retrieving roles for user ${userId}: ${err.message}`,
        err,
      );
      throw err;
    }
  }
}
