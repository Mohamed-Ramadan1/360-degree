import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoCreateDto } from '../dto';
import { CategoryRepository, TodoRepository } from '../repos';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class TodoService {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly logger: LoggerService,
  ) {}

  async createTodo(userId: string, createTodoDto: TodoCreateDto) {
    try {
      if (createTodoDto.categoryId) {
        await this.validateCategoryOwnership(userId, createTodoDto.categoryId);
      }
      const todo = await this.todoRepository.createTodo(userId, createTodoDto);

      return todo;
    } catch (error) {
      this.logger.error('Failed to create todo', error);
      throw error;
    }
  }

  async getAllTodos() {
    return await this.todoRepository.getAllTodos();
  }

  private async validateCategoryOwnership(userId: string, categoryId: string) {
    const category = await this.categoryRepository.findCategory(
      userId,
      categoryId,
    );
    if (!category) {
      throw new NotFoundException(
        'Category not found or does not belong to the user',
      );
    }
  }
}
