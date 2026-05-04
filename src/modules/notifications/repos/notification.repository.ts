import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { INotificationRepository } from '../interfaces';
import { PaginatedResponseDto, PaginationDto } from 'src/common/pagination/dto';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { generateId } from 'src/utils/index';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly paginationService: PaginationService,
  ) {}

  createNotification(
    notification: Partial<Notification>,
  ): Promise<Notification> {
    const entity = this.notificationRepository.create({
      id: generateId(),
      ...notification,
    });
    return this.notificationRepository.save(entity);
  }

  findById(
    userId: string,
    notificationId: string,
  ): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
  }

  async getNotifications(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Notification>> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', pagination.order);

    return await this.paginationService.paginate(queryBuilder, pagination, {
      alias: 'notification',
    });
  }

  getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.findById(userId, notificationId);

    if (!notification) {
      throw new BadRequestException('No notification matching the provided id');
    }

    notification.read = true;
    notification.readAt = notification.readAt ?? new Date();

    await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true, readAt: () => 'NOW()' })
      .where('userId = :userId', { userId })
      .andWhere('read = false')
      .execute();

    return result.affected ?? 0;
  }

  async deleteOne(userId: string, notificationId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if ((result.affected ?? 0) === 0) {
      throw new BadRequestException('No notification matching the provided id');
    }
  }

  async deleteAll(userId: string): Promise<number> {
    const result = await this.notificationRepository.delete({ userId });
    return result.affected ?? 0;
  }
}
