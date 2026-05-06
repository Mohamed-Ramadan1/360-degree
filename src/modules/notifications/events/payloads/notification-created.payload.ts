import { NotificationSourceType } from 'src/common/consts';

// events/payloads/notification-created.payload.ts
export interface NotificationCreatedPayload {
  //   notificationId: string;
  userId: string;
  title: string;
  body: string;
  sourceType?: NotificationSourceType | null;
  sourceId?: string | null;
  //   createdAt: string;
}
