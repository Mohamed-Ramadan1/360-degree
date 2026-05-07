import { NotificationSourceType } from 'src/common/consts';

// events/payloads/notification-created.payload.ts
export interface NotificationCreatedPayload {
  userId: string;
  title: string;
  body: string;
  payload?: Record<string, unknown> | null;
  sourceType?: NotificationSourceType | null;
  sourceId?: string | null;
  //   createdAt: string;
}
