// events/payloads/notification-read.payload.ts
export interface NotificationReadPayload {
  notificationId: string;
  userId: string;
  readAt: string;
}
