import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { PaginationDto } from 'src/common/pagination/dto';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OperationSuccessDto } from 'src/modules/auth/dtos';

@Throttle({ default: { limit: 25, ttl: 600000 } })
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Get notifications',
    description:
      'Retrieves all notifications for the authenticated user with pagination support.',
  })
  @ApiOkResponse({
    description: 'Notifications fetched successfully',
    example: {
      message: 'Notifications fetched successfully',
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          title: 'New notification',
          message: 'You have a new message',
          isRead: false,
          createdAt: '2026-05-04T10:00:00Z',
        },
      ],
      pagination: {
        cursor: 'next-cursor',
        hasMore: true,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items to return',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotifications(@Req() req, @Query() pagination: PaginationDto) {
    const result = await this.notificationsService.getNotifications(
      req.user.id,
      pagination,
    );
    return {
      message: 'Notifications fetched successfully',
      ...result,
    };
  }

  @ApiOperation({
    summary: 'Get unread count',
    description:
      'Retrieves the count of unread notifications for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Unread count fetched successfully',
    example: {
      message: 'Unread count fetched successfully',
      count: 5,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount(@Req() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { message: 'Unread count fetched successfully', count };
  }

  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Marks a specific notification as read for the authenticated user.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'Notification marked as read successfully',
    example: { message: 'Notification marked as read successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid notification ID or permission denied',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: 'string',
  })
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id', new ParseUUIDPipe()) id: string, @Req() req) {
    await this.notificationsService.markAsRead(req.user.id, id);
    return { message: 'Notification marked as read successfully' };
  }

  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications as read for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'All notifications marked as read successfully',
    example: {
      message: 'All notifications marked as read successfully',
      count: 10,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req) {
    const count = await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read successfully', count };
  }

  @ApiOperation({
    summary: 'Delete notification',
    description: 'Deletes a specific notification for the authenticated user.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'Notification deleted successfully',
    example: { message: 'Notification deleted successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid notification ID or permission denied',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: 'string',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req,
  ) {
    await this.notificationsService.deleteNotification(req.user.id, id);
    return { message: 'Notification deleted successfully' };
  }

  @ApiOperation({
    summary: 'Delete all notifications',
    description: 'Deletes all notifications for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'All notifications deleted successfully',
    example: {
      message: 'All notifications deleted successfully',
      count: 10,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAllNotifications(@Req() req) {
    const count = await this.notificationsService.deleteAllNotifications(
      req.user.id,
    );
    return { message: 'All notifications deleted successfully', count };
  }
}
