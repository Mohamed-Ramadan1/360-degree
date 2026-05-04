import { NotificationChannel } from '../../entities/notification.entity';

export interface INotification {
  id: string;

  userId: string;

  title: string;

  body: string;

  payload: Record<string, unknown> | null;

  channel: NotificationChannel;

  sourceType: string | null;

  sourceId: string | null;

  read: boolean;

  readAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
