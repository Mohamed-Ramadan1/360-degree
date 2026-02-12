import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/createUser-dto';
import { LoginUserDto } from '../dto/loginUser-dto.ts';
import { Throttle } from '@nestjs/throttler';
import { SetRefreshCookieInterceptor } from '../interceptors/set-refresh-cookie.interceptor';
import { TransformAuthResponseInterceptor } from '../interceptors/transform-auth-response.interceptor';
import { Public } from 'src/common/decorators/public.decorator';

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
}
