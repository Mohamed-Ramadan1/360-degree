import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { User } from '../entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IUser } from '../interfaces/entities/user.interface';
import { UserRoles } from 'src/common/consts';
import { IUserAuthenticationRepository } from '../interfaces';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class UserAuthenticationRepository implements IUserAuthenticationRepository {
  constructor(
    private readonly loggerService: LoggerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<IUser> {
    const user = this.userRepository.create({ ...userData, id: uuidv7() });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'password'],
    });
    if (!user) throw new NotFoundException('User not found with this email');
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      const result = await this.userRepository.update(userId, {
        lastLoginAt: new Date(),
      });

      if (result.affected === 0) {
        this.loggerService.warn(
          `Failed to update last login for user with ID: ${userId}`,
          UserAuthenticationRepository.name,
        );
      }
    } catch (error) {
      this.loggerService.error(
        `Error updating last login for user with ID: ${userId}`,
        error as Error,
        UserAuthenticationRepository.name,
      );
    }
  }

  async findById(userId: string): Promise<IUser> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    // Update the password and reset the token validation fields
    const result: UpdateResult = await this.userRepository.update(userId, {
      password: newPassword,
      passwordLastChangedAt: new Date(),
    });
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async verifyUserEmail(userId: string): Promise<void> {
    const result: UpdateResult = await this.userRepository.update(userId, {
      isVerified: true,
      verifiedAt: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async createUserWithRoles(userData: {
    email: string;
    name: string;
    password: string;
    roles?: UserRoles[];
  }): Promise<User> {
    return await this.userRepository.save({
      ...userData,
      id: uuidv7(),
      roles: userData.roles ?? [UserRoles.USER],
    });
  }
}
