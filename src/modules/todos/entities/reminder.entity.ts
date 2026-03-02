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

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  daysBefore: number;

  @Column({ type: 'timestamptz', nullable: false })
  reminderAt: Date; // dueDate - daysBefore

  @Column({ type: 'boolean', default: false })
  isSent: boolean;

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

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
