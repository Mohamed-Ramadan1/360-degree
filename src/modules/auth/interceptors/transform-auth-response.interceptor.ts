import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
import { ITokenPair } from '../interfaces/tokens/tokenGeneration.interface';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformAuthResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: { user: IUser; tokenPair: ITokenPair }) => {
        const request: Request = context.switchToHttp().getRequest<Request>();
        if (request.method === 'POST' && request.url.includes('sign-up')) {
          return {
            status: 'user created successfully',
            user: { id: data.user.id, email: data.user.email },
            accessToken: data.tokenPair.accessToken,
          };
        }
        // for login
        return {
          status: 'login successful',
          user: { id: data.user.id, email: data.user.email },
          accessToken: data.tokenPair.accessToken,
        };
      }),
    );
  }
}
