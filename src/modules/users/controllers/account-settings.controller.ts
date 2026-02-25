import { Controller, Patch, UseInterceptors, Req } from '@nestjs/common';
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
}
