import { ConflictException, Injectable } from '@nestjs/common';

// logs imports
import { LoggerService } from 'src/logs/logger.service';

import { IUser } from '../interfaces/entities/user.interface';

import { AdminCreateUserDto } from '../dto';
import { generateWelcomeEmail } from 'src/modules/auth/emails/templates/wellcomEmail';
import { PasswordHelperService } from 'src/common/services/password-helper.service';

import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';

import { EmailQueueService } from 'src/queues';

// repository imports
import { UserAuthenticationRepository, UserRepository } from '../repos';

@Injectable()
export class UsersCrudService {
  private tokenKeyPrefix = 'verification-token-';

  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly userAuthRepository: UserAuthenticationRepository,
    private readonly passwordHelperService: PasswordHelperService,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly emailQueue: EmailQueueService,
  ) {}

  async createUser(userData: AdminCreateUserDto): Promise<IUser> {
    try {
      const hashedPassword: string =
        await this.passwordHelperService.hashPassword(userData.password);

      const user = await this.userAuthRepository.createUserWithRoles({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        roles: userData.roles,
      });

      const tokenKey = `${this.tokenKeyPrefix}${user.id}`;
      const tokenValue: string =
        await this.verificationTokensCreator.createVerificationToken(
          tokenKey,
          900,
        ); // 15 minutes expiration

      const emailContent = generateWelcomeEmail({
        user,
        verificationToken: tokenValue,
        tokenExpiryMinutes: 15,
      });

      await this.emailQueue.addEmailJob({
        type: 'welcome-email',
        to: user.email,
        subject: 'Welcome to 360-degree!',
        text: 'Welcome to 360-degree!',
        html: emailContent,
      });

      return user;
    } catch (error) {
      this.logger.error(
        'Error during user creation',
        error as Error,
        UsersCrudService.name,
      );
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async getUser(userId: string): Promise<IUser> {
    try {
      const user: IUser = await this.userRepository.getUserById(userId);

      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error getting user: ${err.message}`, err);
      throw err;
    }
  }

  async listUsers(): Promise<IUser[]> {
    try {
      const users: IUser[] = await this.userRepository.findAll();
      return users;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error listing users: ${err.message}`, err);
      throw err;
    }
  }
}
