import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { TokenValidationService } from '../services/token-validation.service';

import { UserRepository } from 'src/modules/users/repos/user.repository';
import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
import { TokensTrackingService } from 'src/common/services/tokens-tracking-service.service';
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly tokenValidationService: TokenValidationService,
    private readonly userRepository: UserRepository,
    private readonly tokensTrackingService: TokensTrackingService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // Check if cookies exist and contain refreshToken
    if (!request.cookies || !request.cookies.refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found. Please login again.',
      );
    } else {
      const refreshToken = request.cookies.refreshToken as string;

      const payload = this.tokenValidationService.validate(
        refreshToken,
        'refresh',
      );

      const user: IUser | null = await this.userRepository.getUserById(
        payload.userId,
      );

      if (!user) {
        throw new UnauthorizedException('User not found. Please login again.');
      }
      // check if the token is tracked (whitelisted and not revoked)
      const isTokenValid =
        await this.tokensTrackingService.isTokenWhitelisted(refreshToken);

      if (!isTokenValid) {
        throw new UnauthorizedException(
          'Invalid refresh token. Please login again.',
        );
      }

      request.user = user;
    }

    return true;
  }
}
