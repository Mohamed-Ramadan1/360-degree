import { Controller, Patch, UseInterceptors, Req, Post } from '@nestjs/common';
import { Request } from 'express';
import { AccountSettingsService } from '../services/account-settings.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Throttle } from '@nestjs/throttler';

import { OperationSuccessDto } from '../../auth/dtos';

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Throttle({ default: { limit: 25, ttl: 600000 } })
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('account-settings')
@ApiBearerAuth('JWT-auth')
@Controller('account-settings')
export class AccountSettingsController {
  constructor(
    private readonly accountSettingsService: AccountSettingsService,
  ) {}

  @ApiOperation({
    summary: 'Accept terms and conditions',
    description:
      'Allows a user to accept the terms and conditions of the service.its important for compliance and legal purposes.',
  })
  @ApiOkResponse({
    description: 'Terms accepted successfully',
    type: OperationSuccessDto,
    example: { message: 'Terms accepted successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Terms already accepted or invalid request',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Patch('accept-terms')
  async acceptTerms(@Req() req: Request): Promise<OperationSuccessDto> {
    await this.accountSettingsService.acceptTerms(req.user);

    return { message: 'Terms accepted successfully' };
  }

  @ApiOperation({
    summary: 'Enable notifications',
    description:
      'Allows a user to enable notifications for their account. This setting helps users stay informed about important updates and activities related to their account.',
  })
  @ApiOkResponse({
    description: 'Notifications enabled successfully',
    type: OperationSuccessDto,
    example: { message: 'Notifications enabled successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Notifications already enabled or invalid request',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Patch('notifications/enable')
  async enableNotifications(@Req() req: Request): Promise<OperationSuccessDto> {
    await this.accountSettingsService.enableNotifications(req.user);

    return { message: 'Notifications enabled successfully' };
  }

  @ApiOperation({
    summary: 'Disable notifications',
    description:
      'Allows a user to disable notifications for their account. This setting helps users manage their notification preferences and reduce unwanted alerts.',
  })
  @ApiOkResponse({
    description: 'Notifications disabled successfully',
    type: OperationSuccessDto,
    example: { message: 'Notifications disabled successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Notifications already disabled or invalid request',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Patch('notifications/disable')
  async disableNotifications(
    @Req() req: Request,
  ): Promise<OperationSuccessDto> {
    await this.accountSettingsService.disableNotifications(req.user);

    return { message: 'Notifications disabled successfully' };
  }

  @ApiOperation({
    summary: 'Request phone number verification',
    description:
      "Allows a user to request verification for their phone number. This process typically involves sending a verification code to the user's phone, which they must then enter to confirm ownership of the number.",
  })
  @ApiOkResponse({
    description: 'Phone number verification requested successfully',
    type: OperationSuccessDto,
    example: { message: 'Phone number verification requested successfully' },
  })
  @ApiBadRequestResponse({
    description:
      'Phone number verification already requested or invalid request',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Post('phone/request-verification')
  async requestPhoneNumberVerification(
    @Req() req: Request,
  ): Promise<OperationSuccessDto> {
    await this.accountSettingsService.requestPhoneNumberVerification(req.user);

    return { message: 'Phone number verification requested successfully' };
  }
}
