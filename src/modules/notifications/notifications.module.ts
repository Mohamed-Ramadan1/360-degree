import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './controllers/notifications.controller';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repos';
import { NotificationsService } from './services/notifications.service';
import { NotificationEventsListener } from './events/listeners/notification-events.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    NotificationEventsListener,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
