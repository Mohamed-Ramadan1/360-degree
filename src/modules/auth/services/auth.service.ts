import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/requests/create-user.dto';
import { LoginUserDto } from '../dtos/requests/login-user.dto';
import { LoggerService } from 'src/logs/logger.service';
import { PasswordHelperService } from 'src/common/services/password-helper.service';
import { UserAuthService } from 'src/modules/users/services/user-auth.service';
import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';
import { TokenCreationService } from './token-creation.service';
import { TokensTrackingService } from 'src/common/services/tokens-tracking-service.service';
import { generateWelcomeEmail } from '../emails/templates/wellcomEmail';
import { EmailQueueService } from 'src/queues/services/email-queue.service';
import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
import { ITokenPair } from '../interfaces/tokens/tokenGeneration.interface';
import { IAuthService } from '../interfaces/services/authService.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly passwordHelperService: PasswordHelperService,
    private readonly userAuthService: UserAuthService,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly tokenCreationService: TokenCreationService,
    private readonly tokensTrackingService: TokensTrackingService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async signUp(userData: CreateUserDto) {
    try {
      const hashedPassword: string =
        await this.passwordHelperService.hashPassword(userData.password);

      const user = await this.userAuthService.registerUser({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
      });

      const tokenKey = `verification-token-${user.id}`;
      const tokenValue: string =
        await this.verificationTokensCreator.createVerificationToken(
          tokenKey,
          900,
        ); // 15 minutes expiration

      const tokenPair = this.tokenCreationService.generateTokenPair(user.id);

      await this.trackUserRefreshToken(user.id, tokenPair.refreshToken);

      const emailContent = generateWelcomeEmail({
        user,
        verificationToken: tokenValue,
        tokenExpiryMinutes: 15,
      });

      await this.emailQueueService.addEmailJob({
        type: 'welcome-email',
        to: user.email,
        subject: 'Welcome to 360-degree!',
        text: 'Welcome to 360-degree!',
        html: emailContent,
      });

      return { user, tokenPair };
    } catch (error) {
      this.logger.error(
        'Error during sign up',
        error as Error,
        AuthService.name,
      );
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const user: IUser = await this.userAuthService.findByEmail(
        loginUserDto.email,
      );

      const isPasswordValid: boolean =
        await this.passwordHelperService.comparePasswords(
          loginUserDto.password,
          user.password,
        );
      if (!isPasswordValid)
        throw new UnauthorizedException('Invalid credentials');

      if (user.accountToBeDeleted) {
        throw new UnauthorizedException(
          'User account is scheduled for deletion. if you do not request this action please contact support immediately.',
        );
      }

      const tokenPair: ITokenPair = this.tokenCreationService.generateTokenPair(
        user.id,
      );

      await Promise.all([
        this.userAuthService.updateLastLogin(user.id),
        this.trackUserRefreshToken(user.id, tokenPair.refreshToken),
      ]);

      // Remove password before returning user object
      user.password = '';
      return { user, tokenPair };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('Error during login', err, AuthService.name);
      throw err;
    }
  }

  generateNewAccessToken(user: IUser) {
    try {
      const tokenPair: ITokenPair = this.tokenCreationService.generateTokenPair(
        user.id,
      );
      return tokenPair.accessToken;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(
        `Failed to generate new access token for user ${user.id}: ${err.message}`,
        err,
      );
      throw err;
    }
  }

  async logout(userId: string) {
    try {
      await this.tokensTrackingService.revokeAllUserTokens(userId);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(`Failed to logout user ${userId}: ${err.message}`, err);
      throw err;
    }
  }

  private async trackUserRefreshToken(userId: string, refreshToken: string) {
    try {
      await this.tokensTrackingService.trackRefreshToken(refreshToken, userId);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(
        `Failed to track refresh token for user ${userId}: ${err.message}`,
        err,
      );
      throw err;
    }
  }
}
