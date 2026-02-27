import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class SetRefreshCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (data?.tokenPair?.refreshToken) {
          const response: Response = context
            .switchToHttp()
            .getResponse<Response>();
          response.cookie('refreshToken', data.tokenPair.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
        }
      }),
    );
  }
}
