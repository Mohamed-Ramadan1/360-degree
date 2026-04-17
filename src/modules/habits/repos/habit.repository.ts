import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Habit } from '../entities/habit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetHabitsDto, HabitCreateDto } from '../dto';
import { generateId } from 'src/utils';
import { PaginationService } from 'src/common/pagination/paginate.service';

@Injectable()
export class HabitRepository {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>,
    private readonly paginationService: PaginationService,
  ) {}
  async createHabit(
    createHabitDto: HabitCreateDto,
    nextTriggerAt: Date,
    endDate: Date | null,
    userId: string,
  ) {
    return await this.habitRepository.save({
      id: generateId(),
      ...createHabitDto,
      nextTriggerAt,
      endDate,
      ownerId: userId,
    });
  }

  async findDueHabits(): Promise<Habit[] | null> {
    const now = new Date();

    return this.habitRepository
      .createQueryBuilder('habit')
      .leftJoin('habit.owner', 'owner')
      .select([
        'habit.id',
        'habit.title',
        'habit.recurrenceType',
        'habit.time',
        'habit.days',
        'habit.dayOfMonth',
        'habit.endDate',
        'habit.nextTriggerAt',
        'owner.email',
        'owner.name',
        'owner.timezone',
      ])
      .where('habit.isActive = true')
      .andWhere('habit.nextTriggerAt <= :now', { now })
      .getMany();
  }

  async update(id: string, updateData: Partial<Habit>): Promise<void> {
    await this.habitRepository.update(id, updateData);
  }

  async findById(id: string, ownerId: string): Promise<Habit | null> {
    const habit = await this.habitRepository.findOne({
      where: { id, ownerId },
    });
    return habit;
  }

  async delete(id: string): Promise<void> {
    await this.habitRepository.delete({ id });
  }

  async findHabits(ownerId: string, getHabitsDto: GetHabitsDto) {
    const queryBuilder = this.habitRepository
      .createQueryBuilder('habit')
      .where('habit.ownerId = :ownerId', { ownerId })
      .select([
        'habit.id',
        'habit.title',
        'habit.recurrenceType',
        'habit.time',
        'habit.days',
        'habit.dayOfMonth',
        'habit.endDate',
      ]);

    return this.paginationService.paginate(queryBuilder, getHabitsDto, {
      alias: 'habit',
      filters: {
        title: { value: getHabitsDto.title, operator: 'like' },
        recurrenceType: { value: getHabitsDto.recurrenceType },
      },
    });
  }
}
