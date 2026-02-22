import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RolesManagementService } from '../services/roles-management.service';
import { AssignRolesDto, RemovedRolesDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { RolesGuard } from 'src/common/guards';
import { SelfRolesAssignmentGuard } from '../guards/self-roles-assignment.guard';
import { UserRoles } from 'src/common/consts';
import { Roles } from 'src/common/decorators';
import { OperationSuccessDto } from 'src/modules/auth/dtos';

@Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.USER)
@UseGuards(RolesGuard, SelfRolesAssignmentGuard)
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('Roles Management')
@ApiBearerAuth('JWT-auth')
@Controller('roles-management')
export class RolesManagementController {
  constructor(private rolesManagementService: RolesManagementService) {}

  @ApiOperation({
    summary: 'Assign User Roles',
    description: 'Assigns specified roles to a specific user.',
  })
  @ApiOkResponse({
    description: 'Roles assigned successfully',
    type: OperationSuccessDto,
    example: { message: 'Roles assigned successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID supplied',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to assign roles to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: AssignRolesDto,
    description: 'Payload to assign roles to a user',
    examples: {
      assignRoles: {
        summary: 'Assign Roles Example',
        value: {
          roles: ['admin', 'support_agent'],
        },
      },
      example: {
        summary: 'Invalid Assign Roles Example',
        value: {
          roles: ['invalidRole'],
        },
      },
    },
  })
  @Throttle({ default: { limit: 50, ttl: 20000 } })
  @Patch('assign-roles/:userId')
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    await this.rolesManagementService.assignRoles(userId, assignRolesDto.roles);
    return {
      message: 'Roles assigned successfully',
    };
  }

  @ApiOperation({
    summary: 'Remove User Roles',
    description: 'Removes specified roles from a specific user.',
  })
  @ApiOkResponse({
    description: 'Roles removed successfully',
    type: OperationSuccessDto,
    example: { message: 'Roles removed successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID supplied',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to remove roles from',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: RemovedRolesDto,
    description: 'Payload to remove roles from a user',
    examples: {
      removeRoles: {
        summary: 'Remove Roles Example',
        value: {
          roles: ['admin', 'moderator'],
        },
      },
      example: {
        summary: 'Invalid Remove Roles Example',
        value: {
          roles: ['invalidRole'],
        },
      },
    },
  })
  @Throttle({ default: { limit: 50, ttl: 20000 } })
  @Patch('remove-roles/:userId')
  @HttpCode(HttpStatus.OK)
  async removeRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() removeRolesDto: RemovedRolesDto,
  ): Promise<OperationSuccessDto> {
    await this.rolesManagementService.removeRoles(userId, removeRolesDto.roles);
    return {
      message: 'Roles removed successfully',
    };
  }
}
