import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
import { LoggerService } from 'src/logs/logger.service';
import { ROLES_KEY } from 'src/common/decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: LoggerService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const hasRequiredRole = this.hasRole(user, requiredRoles);
    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }

  private hasRole(user: IUser, roles: string[]): boolean {
    try {
      if (!user || !user.roles || !roles || roles.length === 0) {
        return false;
      }

      return user.roles.some((role: string) => roles.includes(role));
    } catch (error: any) {
      this.logger.error('Error checking user roles', error as Error);
      return false;
    }
  }
}
