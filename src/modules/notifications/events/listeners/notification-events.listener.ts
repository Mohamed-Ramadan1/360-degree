import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoggerService } from 'src/logs/logger.service';
import { NotificationEvents } from '../names/notification-events.constants';
import {
  NotificationCreatedPayload,
  NotificationReadPayload,
} from '../payloads';
import { NotificationsService } from '../../services/notifications.service';

@Injectable()
export class NotificationEventsListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly notificationService: NotificationsService,
  ) {}

  @OnEvent(NotificationEvents.Created)
  async handleNotificationCreated(payload: NotificationCreatedPayload) {
    const notification =
      await this.notificationService.createNotification(payload);

    this.logger.log(
      `Notification created for user ${payload.userId} (${notification.id})`,
      'NotificationEventsListener',
    );
  }
}
