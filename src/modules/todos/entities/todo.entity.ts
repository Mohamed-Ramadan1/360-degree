import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { TodoPriority, TodoStatus } from 'src/common/consts';
import { ITodo } from '../interfaces/entities/todo.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { Category } from './category.entity';
import { Reminder } from './reminder.entity';

@Entity('todos')
export class Todo implements ITodo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'enum', enum: TodoPriority, default: TodoPriority.MEDIUM })
  priority: TodoPriority;

  @Column({ type: 'enum', enum: TodoStatus, default: TodoStatus.PENDING })
  status: TodoStatus;

  @Column({ type: 'boolean', default: true })
  isPersonal: boolean; // true = personal, false = shared

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Index()
  @Column({ type: 'uuid', nullable: false })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Reminder, (reminder) => reminder.todo, { cascade: true })
  reminders: Reminder[];

  @Index()
  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
