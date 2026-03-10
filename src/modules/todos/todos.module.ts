import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodosController } from './controllers/todos.controller';
import { TodoService } from './services/todo.service';
import { CategoryRepository, TodoRepository } from './repos';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/category.service';
import { Category } from './entities/category.entity';
import { Reminder } from './entities/reminder.entity';
import { ReminderRepository } from './repos/reminder.repo';
import { ReminderService } from './services/reminder.service';
import { RemindersController } from './controllers/reminders.controller';
import { ReminderScheduler } from './schedulers/reminder.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, Category, Reminder])],
  controllers: [CategoriesController, TodosController, RemindersController],
  providers: [
    TodoService,
    TodoRepository,
    CategoriesService,
    CategoryRepository,
    ReminderRepository,
    ReminderService,
    ReminderScheduler,
  ],
  exports: [ReminderRepository],
})
export class TodosModule {}
