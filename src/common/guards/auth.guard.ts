import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
import { UserRepository } from 'src/modules/users/repos/user.repository';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenValidationService } from 'src/modules/auth/services/token-validation.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, IS_PROTECTED_KEY } from 'src/common/decorators';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private userRepository: UserRepository,
    private tokenValidationService: TokenValidationService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isProtected = this.reflector.getAllAndOverride<boolean>(
      IS_PROTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isProtected) {
      await this.validateRequest(context);
      return true;
    }

    // Skip authentication for public routes
    if (isPublic) {
      return true;
    }

    await this.validateRequest(context);

    return true;
  }

  private async validateRequest(context: ExecutionContext): Promise<void> {
    const accessToken = this.extractTokenFromHeader(
      context.switchToHttp().getRequest().headers.authorization as string,
    );

    const user: IUser = await this.validateTokenAndGetUser(accessToken);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const request: Request = context.switchToHttp().getRequest();

    request.user = user;
  }

  private extractTokenFromHeader(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header must be Bearer token',
      );
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || !parts[1]) {
      throw new UnauthorizedException('Malformed authorization header');
    }

    return parts[1];
  }

  private async validateTokenAndGetUser(token: string): Promise<IUser> {
    const payload = this.tokenValidationService.validate(token, 'access');

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found or has been deactivated');
    }

    // Optional: Add additional user validation (e.g., active status)
    // if (!user.isActive) {
    //   throw new UnauthorizedException('User account is inactive');
    // }

    if (user.accountToBeDeleted) {
      throw new UnauthorizedException(
        'User account is scheduled for deletion. if you do not request this action please contact support immediately.',
      );
    }

    if (user.isDisabled) {
      throw new UnauthorizedException(
        'User account is disabled you cannot login. Please contact support for more information.',
      );
    }
    return user;
  }
}
