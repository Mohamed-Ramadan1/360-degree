import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodosController } from './controllers/todos.controller';
import { TodoService } from './services/todo.service';
import { CategoryRepository, TodoRepository } from './repos';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/category.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, Category])],
  controllers: [TodosController, CategoriesController],
  providers: [
    TodoService,
    TodoRepository,
    CategoriesService,
    CategoryRepository,
  ],
})
export class TodosModule {}
