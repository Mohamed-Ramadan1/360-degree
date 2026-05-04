import { Notification } from '../../entities/notification.entity';
import { PaginatedResponseDto, PaginationDto } from 'src/common/pagination/dto';
import { INotification } from '../entities/notification.interface';

export interface INotificationRepository {
  createNotification(
    notification: Partial<Notification>,
  ): Promise<INotification>;

  findById(
    userId: string,
    notificationId: string,
  ): Promise<INotification | null>;

  getNotifications(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<INotification>>;

  getUnreadCount(userId: string): Promise<number>;

  markAsRead(userId: string, notificationId: string): Promise<void>;

  markAllAsRead(userId: string): Promise<number>;

  deleteOne(userId: string, notificationId: string): Promise<void>;

  deleteAll(userId: string): Promise<number>;
}
