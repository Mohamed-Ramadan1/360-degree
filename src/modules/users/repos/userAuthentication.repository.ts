import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IUser } from '../interfaces/entities/user.interface';

@Injectable()
export class UserAuthenticationRepository {
  constructor(
    private readonly loggerService: LoggerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<IUser> {
    const user = this.userRepository.create(userData);
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
}
