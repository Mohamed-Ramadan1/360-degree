import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AccountRecoveryService } from '../services/account-recovery.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('recovery')
export class AccountRecoveryController {
  constructor(
    private readonly accountRecoveryService: AccountRecoveryService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(TransformResponseInterceptor)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.accountRecoveryService.sendPasswordResetEmail(
      forgotPasswordDto.email,
    );
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }
}
