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

@Entity('habits')
@Index(['isActive', 'timeUTC'])
export class Habit {
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

  @Index()
  @Column({ type: 'varchar', length: 5, nullable: false })
  timeUTC: string;

  @Column({ type: 'int', array: true, nullable: true })
  days: number[] | null;

  @Column({ type: 'int', nullable: true })
  dayOfMonth: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastSentAt: Date | null;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
