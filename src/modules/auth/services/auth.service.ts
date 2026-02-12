import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { LoggerService } from 'src/logs/logger.service';
import { PasswordHelperService } from 'src/common/services/password-helper.service';
import { UserAuthService } from 'src/modules/users/services/user-auth.service';
import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';
import { TokenCreationService } from './token-creation.service';
import { TokensTrackingService } from 'src/common/services/tokens-tracking-service.service';
import { generateWelcomeEmail } from '../emails/templates/wellcomEmail';
import { EmailQueueService } from 'src/queues/services/email-queue.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly passwordHelperService: PasswordHelperService,
    private readonly userAuthService: UserAuthService,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly tokenCreationService: TokenCreationService,
    private readonly tokensTrackingService: TokensTrackingService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async signUp(userData: CreateAuthDto) {
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
