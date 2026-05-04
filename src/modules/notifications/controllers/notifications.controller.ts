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

@UseInterceptors(TransformResponseInterceptor)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount(@Req() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { message: 'Unread count fetched successfully', count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id', new ParseUUIDPipe()) id: string, @Req() req) {
    await this.notificationsService.markAsRead(req.user.id, id);
    return { message: 'Notification marked as read successfully' };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req) {
    const count = await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read successfully', count };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req,
  ) {
    await this.notificationsService.deleteNotification(req.user.id, id);
    return { message: 'Notification deleted successfully' };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAllNotifications(@Req() req) {
    const count = await this.notificationsService.deleteAllNotifications(
      req.user.id,
    );
    return { message: 'All notifications deleted successfully', count };
  }
}
