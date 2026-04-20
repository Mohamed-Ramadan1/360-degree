import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

import { RecurrenceType } from 'src/common/consts/habit-recurrence';
import { IHabit } from '../interfaces';

@Entity('habits')
@Index(['nextTriggerAt', 'isActive'])
export class Habit implements IHabit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: RecurrenceType, nullable: false })
  recurrenceType: RecurrenceType;

  @Column({ type: 'varchar', length: 5, nullable: false })
  time: string;

  @Column({ type: 'int', array: true, nullable: true })
  days: number[] | null;

  @Column({ type: 'int', nullable: true })
  dayOfMonth: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  nextTriggerAt: Date | null;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'int', default: 0 })
  completionCount: number; // for each type of habits

  @Column({ type: 'timestamptz', nullable: true })
  lastCompletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
