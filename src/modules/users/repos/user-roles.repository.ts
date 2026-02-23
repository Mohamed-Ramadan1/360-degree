import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from 'src/common/consts/roles';
import { IUser } from '../interfaces/entities/user.interface';

@Injectable()
export class UserRolesRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async assignRoles(
    userId: string,
    roles: UserRoles[],
  ): Promise<{ user: IUser; addedRoles: UserRoles[]; isModified: boolean }> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.getUserById(userId, manager);

      // have roles check to prevent extra db call
      const currentRoles = user.roles ?? [];
      const newRoles = roles.filter((role) => !currentRoles.includes(role));

      if (newRoles.length === 0) {
        return { user, addedRoles: [], isModified: false };
      }
      user.roles = [...currentRoles, ...newRoles];
      const updatedUser = await manager.save(user);
      return {
        user: updatedUser,
        addedRoles: newRoles,
        isModified: true,
      };
    });
  }

  async removeRoles(
    userId: string,
    roles: UserRoles[],
  ): Promise<{
    user: IUser;
    remainRoles: UserRoles[];
    isModified: boolean;
  }> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.getUserById(userId, manager);
      const userRoleExist = this.validateUserRoleExistence(roles);
      const currentRoles = user.roles ?? [];
      const userHasRole = roles.every((role) => currentRoles.includes(role));

      if (!userHasRole || userRoleExist) {
        return { user, remainRoles: currentRoles, isModified: false };
      }

      const remainRoles: UserRoles[] = (user.roles ?? []).filter(
        (role) => !roles.includes(role),
      );

      user.roles = remainRoles;
      const updatedUser = await manager.save(user);
      return {
        user: updatedUser,
        remainRoles,
        isModified: true,
      };
    });
  }

  async resetRoles(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const user: IUser | null = await manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('No user match provided id.');

      user.roles = [UserRoles.USER];
      await manager.save(user);
    });
  }

  async bulkAssignRoles(
    userIds: string[],
    rolesToAdd: UserRoles[],
  ): Promise<{
    success: boolean;
    updated: number;
    skipped: number;
    details: {
      updatedUserIds: string[];
      skippedUserIds: string[];
    };
  }> {
    const isValid = this.validateUserRoleExistence(rolesToAdd);
    if (!isValid) {
      return {
        success: false,
        updated: 0,
        skipped: userIds.length,
        details: {
          updatedUserIds: [],
          skippedUserIds: userIds,
        },
      };
    }

    return await this.dataSource.transaction(async (manager) => {
      // Step 1: Fetch all users
      const users = await this.getUsersByIds(userIds, manager);

      // Step 2: Validate all users exist (strict validation)
      if (users.length !== userIds.length) {
        const foundIds = new Set(users.map((u) => u.id));
        const missing = userIds.filter((id) => !foundIds.has(id));
        throw new NotFoundException(`Users not found: ${missing.join(', ')}`);
      }

      // Step 3: Categorize users
      const usersToUpdate: User[] = [];
      const skippedUserIds: string[] = [];

      for (const user of users) {
        const currentRoles = user.roles ?? [];

        // Check if user needs ANY of the roles
        const newRoles = rolesToAdd.filter(
          (role) => !currentRoles.includes(role),
        );

        if (newRoles.length > 0) {
          user.roles = [...currentRoles, ...newRoles];
          usersToUpdate.push(user);
        } else {
          skippedUserIds.push(user.id);
        }
      }

      // Step 4: Bulk save if there are updates
      if (usersToUpdate.length > 0) {
        await manager.save(usersToUpdate);
      }

      return {
        success: true,
        updated: usersToUpdate.length,
        skipped: skippedUserIds.length,
        details: {
          updatedUserIds: usersToUpdate.map((u) => u.id),
          skippedUserIds,
        },
      };
    });
  }

  async bulkRemoveRoles(
    userIds: string[],
    rolesToRemove: UserRoles[],
  ): Promise<{ success: boolean; updated: number; notFound: string[] }> {
    const isValid = this.validateUserRoleExistence(rolesToRemove);
    if (!isValid) {
      return {
        success: false,
        updated: 0,
        notFound: userIds,
      };
    }

    return await this.dataSource.transaction(async (manager) => {
      const ids = [...new Set(userIds)];
      const users = await manager.find(User, {
        where: { id: In(ids) },
        select: ['id', 'roles'],
      });

      const foundIds = new Set(users.map((u) => u.id));
      const notFoundIds = userIds.filter((id) => !foundIds.has(id));

      if (notFoundIds.length > 0) {
        throw new NotFoundException(
          `Users not found: ${notFoundIds.join(', ')}`,
        );
      }

      // Filter and update roles in memory
      const usersToUpdate: User[] = [];
      const skippedUserIds: string[] = [];

      for (const user of users) {
        const currentRoles = user.roles || [];

        const remainingRoles = currentRoles.filter(
          (role) => !rolesToRemove.includes(role),
        );

        // Check if anything changed
        if (remainingRoles.length !== currentRoles.length) {
          user.roles = remainingRoles;
          usersToUpdate.push(user);
        } else {
          // User didn't have any of the roles to remove
          skippedUserIds.push(user.id);
        }
      }

      // Bulk save if there are updates
      if (usersToUpdate.length > 0) {
        await manager.save(User, usersToUpdate);
      }

      return {
        success: true,
        updated: usersToUpdate.length,
        notFound: notFoundIds,
      };
    });
  }

  private async getUsersByIds(
    userIds: string[],
    manager: EntityManager,
  ): Promise<IUser[]> {
    const ids = [...new Set(userIds)];
    const users = await manager.find(User, {
      where: { id: In(ids) },
    });
    return users;
  }

  private async getUserById(
    userId: string,
    manager: EntityManager,
  ): Promise<IUser> {
    const user = await manager.findOne(User, {
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('No user match provided id.');
    }

    return user;
  }

  private validateUserRoleExistence(roles: UserRoles[]): boolean {
    return roles.includes(UserRoles.USER);
  }
}
