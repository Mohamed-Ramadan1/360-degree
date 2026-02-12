import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/createUser-dto';
import { LoginUserDto } from '../dto/loginUser-dto.ts';
import { Throttle } from '@nestjs/throttler';
import { SetRefreshCookieInterceptor } from '../interceptors/set-refresh-cookie.interceptor';
import { TransformAuthResponseInterceptor } from '../interceptors/transform-auth-response.interceptor';
import { Public } from 'src/common/decorators/public.decorator';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { Request, response } from 'express';
import { Protected } from 'src/common/decorators/protected.decorator';
import { ClearRefreshCookieInterceptor } from '../interceptors/clear-refresh.cookie.interceptor';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(
    TransformAuthResponseInterceptor,
    SetRefreshCookieInterceptor,
  )
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @UseInterceptors(
    TransformAuthResponseInterceptor,
    SetRefreshCookieInterceptor,
  )
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const { user, tokenPair } = await this.authService.login(loginUserDto);
    return { user, tokenPair };
  }

  // @UseInterceptors(TransformResponseInterceptor)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(RefreshTokenGuard)
  @Post('access-token')
  @HttpCode(HttpStatus.OK)
  accessToken(@Req() req: Request) {
    const accessToken: string = this.authService.generateNewAccessToken(
      req.user,
    );
    return { message: 'new access token created', accessToken };
  }

  // @UseInterceptors(TransformResponseInterceptor)
  // @Protected()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(ClearRefreshCookieInterceptor)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user;
    await this.authService.logout(user.id);
    return {
      message: 'user logged out successfully.',
    };
  }
}
