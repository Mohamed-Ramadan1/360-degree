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
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { Throttle } from '@nestjs/throttler';
import { SetRefreshCookieInterceptor } from '../interceptors/set-refresh-cookie.interceptor';
import { TransformAuthResponseInterceptor } from '../interceptors/transform-auth-response.interceptor';

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
  async signUp(@Body() createUserDto: CreateAuthDto) {
    return await this.authService.signUp(createUserDto);
  }
}
