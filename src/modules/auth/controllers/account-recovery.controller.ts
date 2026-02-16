import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AccountRecoveryService } from '../services/account-recovery.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators';
import {
  ForgotPasswordDto,
  OperationSuccessDto,
  ResetPasswordDto,
} from '../dtos/index';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
@Public()
@ApiTags('Account Recovery')
@Controller('recovery')
export class AccountRecoveryController {
  constructor(
    private readonly accountRecoveryService: AccountRecoveryService,
  ) {}

  @ApiOperation({
    summary: 'Initiate password reset',
    description:
      'Sends a password reset email to user if the email exists in the system.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'Password reset email sent sent successfully.',
    example: {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email format.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email address of the user requesting password reset.',
    examples: {
      valid: {
        summary: 'Valid email',
        value: {
          email: 'user@example.com',
        },
      },
      invalid: {
        summary: 'Invalid email format',
        value: {
          email: 'invalid-email',
        },
      },
    },
  })
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

  @ApiOperation({
    summary: 'Reset user password',
    description:
      'Resets the user password using the provided token and new password.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'Password has been reset successfully.',
    example: {
      message: 'Password has been reset successfully',
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid token or password reset failed.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'New password for the user.',
    examples: {
      valid: {
        summary: 'Valid new password',
        value: {
          newPassword: 'NewSecurePassword123!',
        },
      },
      invalid: {
        summary: 'Invalid new password',
        value: {
          newPassword: 'weak',
        },
      },
    },
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user resetting the password.',
    example: '1e5f9f22-a0d2-4c5e-9b02-ae56297cf45b',
  })
  @ApiParam({
    name: 'token',
    description: 'Token for resetting the password.',
    example: '4ca304c1a232b1cf01a86bf27c3b2bf5d0a8fe1f8b21a7a7a4fdd9c0c4711960',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password/:userId/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('userId', new ParseUUIDPipe()) userId: string,
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

  @ApiOperation({
    summary: 'Verify user email',
    description:
      'Verifies the user email using the provided token. This is typically used for email verification after registration.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'Email has been verified successfully.',
    example: {
      message: 'Email has been verified successfully',
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid token or email verification failed.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user verifying their email.',
    example: '1e5f9f22-a0d2-4c5e-9b02-ae56297cf45b',
  })
  @ApiParam({
    name: 'token',
    description: 'Token for verifying the email.',
    example: '4ca304c1a232b1cf01a86bf27c3b2bf5d0a8fe1f8b21a7a7a4fdd9c0c4711960',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-email/:userId/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Param('token') token: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    await this.accountRecoveryService.verifyEmail(token, userId);

    return {
      message: 'Email has been verified successfully',
    };
  }
}
