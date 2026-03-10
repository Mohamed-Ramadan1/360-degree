import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Todo } from './todo.entity';
import { IReminder } from '../interfaces';

@Entity('reminders')
@Index(['reminderAt', 'isSent'])
export class Reminder implements IReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', nullable: false })
  reminderAt: Date;

  @Column({ type: 'boolean', default: false })
  isSent: boolean;

  @Index()
  @Column({ type: 'uuid', nullable: false })
  todoId: string;

  @ManyToOne(() => Todo, (todo) => todo.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'todoId' })
  todo: Todo;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
