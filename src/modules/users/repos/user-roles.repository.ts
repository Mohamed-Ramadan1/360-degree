import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
}
