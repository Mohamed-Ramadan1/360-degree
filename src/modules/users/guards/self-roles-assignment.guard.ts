import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/entities/user.interface';
import { Request } from 'express';

@Injectable()
export class SelfRolesAssignmentGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user: IUser = request.user;

    // for remove and assign roles
    if (user.id === request.params.userId) {
      throw new BadRequestException('You cannot modify your own roles.');
    }

    // for bulk operations, no need to check as userId param is not present
    if (
      (request.method === 'PATCH' && request.url.includes('bulk-remove')) ||
      request.url.includes('bulk-assign')
    ) {
      if (request.body.users.includes(user.id)) {
        throw new BadRequestException('You cannot modify your own roles.');
      }
    }

    return true;
  }
}
