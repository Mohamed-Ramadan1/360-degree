import { PaginatedResponseDto, PaginationDto } from 'src/common/pagination/dto';
import { INotification } from '../entities/notification.interface';

export interface INotificationsService {
  createNotification(
    notification: Partial<INotification>,
  ): Promise<INotification>;

  getNotifications(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<INotification>>;

  getUnreadCount(userId: string): Promise<number>;

  markAsRead(userId: string, notificationId: string): Promise<void>;

  markAllAsRead(userId: string): Promise<number>;

  deleteNotification(userId: string, notificationId: string): Promise<void>;

  deleteAllNotifications(userId: string): Promise<number>;
}
