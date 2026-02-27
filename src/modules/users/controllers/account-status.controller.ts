import { Req, Controller, UseInterceptors, Post } from '@nestjs/common';
import { AccountStatusService } from '../services/account-status.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { OperationSuccessDto } from '../../auth/dtos';

@Throttle({ default: { limit: 25, ttl: 600000 } })
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('Account Status')
@ApiBearerAuth('JWT-auth')
@Controller('account-status')
export class AccountStatusController {
  constructor(private readonly accountStatusService: AccountStatusService) {}

  @ApiOperation({
    summary: 'Activate Account',
    description:
      'Activates a user account, allowing access to all features and services.',
  })
  @ApiOkResponse({
    description: 'Account activated successfully',
    type: OperationSuccessDto,
    example: { message: 'Account activated successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Account is already active or invalid request',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Post('activate')
  async activateAccount(@Req() req: Request): Promise<OperationSuccessDto> {
    await this.accountStatusService.activateAccount(req.user);

    return {
      message: 'Account activated successfully',
    };
  }

  @ApiOperation({
    summary: 'Deactivate Account',
    description:
      'Deactivates a user account, restricting access to features and services.',
  })
  @ApiOkResponse({
    description: 'Account deactivated successfully',
    type: OperationSuccessDto,
    example: { message: 'Account deactivated successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Account is already deactivated or invalid request',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Post('deactivate')
  async deactivateAccount(@Req() req: Request): Promise<OperationSuccessDto> {
    await this.accountStatusService.deactivateAccount(req.user);

    return {
      message: 'Account deactivated successfully',
    };
  }
}
