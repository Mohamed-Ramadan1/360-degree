import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { IUser } from '../interfaces/entities/user.interface';
import { UserAuthenticationRepository } from '../repos/userAuthentication.repository';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly userAuthRepository: UserAuthenticationRepository,
    private readonly logger: LoggerService,
  ) {}

  async registerUser(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<IUser> {
    try {
      const user = await this.userAuthRepository.createUser(userData);
      if (!user) {
        throw new BadRequestException('User registration failed');
      }
      return user;
    } catch (err: unknown) {
      const error =
        err instanceof Error
          ? err
          : new Error('Unknown error occurred during user registration');
      this.logger.error(
        `Error in UserAuthService.registerUser: ${error.message}`,
        error,
        UserAuthService.name,
      );
      throw error;
    }
  }
}
