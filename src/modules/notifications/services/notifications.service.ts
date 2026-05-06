import { Injectable, NotFoundException } from '@nestjs/common';
import { INotification, INotificationsService } from '../interfaces';
import { NotificationRepository } from '../repos/notification.repository';
import { PaginatedResponseDto, PaginationDto } from 'src/common/pagination/dto';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class NotificationsService implements INotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: LoggerService,
  ) {}

  async createNotification(
    notification: Partial<INotification>,
  ): Promise<INotification> {
    try {
      return await this.notificationRepository.createNotification(notification);
    } catch (error) {
      this.logger.error(
        'Failed to create notification',
        error as Error,
        'NotificationsService',
      );
      throw error;
    }
  }

  async getNotifications(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<INotification>> {
    try {
      return await this.notificationRepository.getNotifications(
        userId,
        pagination,
      );
    } catch (err) {
      this.logger.error(
        'Failed to fetch notifications',
        err as Error,
        'NotificationsService',
      );
      throw err;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.notificationRepository.getUnreadCount(userId);
    } catch (err) {
      this.logger.error(
        'Failed to get unread notification count',
        err as Error,
        'NotificationsService',
      );
      throw err;
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await this.notificationRepository.markAsRead(userId, notificationId);
    } catch (err) {
      this.logger.error(
        'Failed to mark notification as read',
        err as Error,
        'NotificationsService',
      );
      throw new NotFoundException('No notification matching the provided id');
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      return await this.notificationRepository.markAllAsRead(userId);
    } catch (err) {
      this.logger.error(
        'Failed to mark all notifications as read',
        err as Error,
        'NotificationsService',
      );
      throw err;
    }
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<void> {
    try {
      await this.notificationRepository.deleteOne(userId, notificationId);
    } catch (err) {
      this.logger.error(
        'Failed to delete notification',
        err as Error,
        'NotificationsService',
      );
      throw new NotFoundException('No notification matching the provided id');
    }
  }

  async deleteAllNotifications(userId: string): Promise<number> {
    try {
      return await this.notificationRepository.deleteAll(userId);
    } catch (err) {
      this.logger.error(
        'Failed to delete all notifications',
        err as Error,
        'NotificationsService',
      );
      throw err;
    }
  }
}
