import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AccountRecoveryService } from '../services/account-recovery.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ResetPasswordDto } from '../dto/reset-password.dto';

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

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password/:userId/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('userId') userId: string,
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.accountRecoveryService.resetPassword(
      token,
      resetPasswordDto.newPassword,
      userId,
    );

    return {
      message: 'Password has been reset successfully',
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-email/:userId/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Param('token') token: string,
    @Param('userId') userId: string,
  ) {
    await this.accountRecoveryService.verifyEmail(token, userId);

    return {
      message: 'Email has been verified successfully',
    };
  }
}
