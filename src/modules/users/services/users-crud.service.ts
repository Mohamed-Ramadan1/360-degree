import { ConflictException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from 'src/modules/notifications/events/names/notification-events.constants';
import { NotificationSourceType } from 'src/common/consts';

// logs imports
import { LoggerService } from 'src/logs/logger.service';

import { IUser } from '../interfaces/entities/user.interface';

import { AdminCreateUserDto, GetUsersDto } from '../dto';
import { generateWelcomeEmail } from 'src/modules/auth/emails/templates/wellcomEmail';
import { PasswordHelperService } from 'src/common/services/password-helper.service';

import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';

import { EmailQueueService } from 'src/queues';

// repository imports
import { UserAuthenticationRepository, UserRepository } from '../repos';
import { UserRoles } from 'src/common/consts';
import { IUserCrudService } from '../interfaces';

@Injectable()
export class UsersCrudService implements IUserCrudService {
  private tokenKeyPrefix = 'verification-token-';

  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly userAuthRepository: UserAuthenticationRepository,
    private readonly passwordHelperService: PasswordHelperService,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly emailQueue: EmailQueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(userData: AdminCreateUserDto): Promise<IUser> {
    try {
      const hashedPassword: string =
        await this.passwordHelperService.hashPassword(userData.password);

      this.ensureUserHasUserRole(userData.roles);

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

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: user.id,
        title: 'Account Created by Admin',
        body: 'An account was created for you by an administrator. Please verify your email to get started.',
        sourceType: NotificationSourceType.SYSTEM,
        sourceId: user.id,
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

  async listUsers(getUsersDto: GetUsersDto) {
    try {
      const result = await this.userRepository.findAll(getUsersDto);
      return result;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error listing users: ${err.message}`, err);
      throw err;
    }
  }

  private ensureUserHasUserRole(roles: UserRoles[]) {
    if (!roles.includes(UserRoles.USER)) {
      roles.push(UserRoles.USER);
    }
  }
}
