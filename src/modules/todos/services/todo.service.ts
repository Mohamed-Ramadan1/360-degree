import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoCreateDto, UpdateTodoDto, UpdateTodoStatusDto } from '../dto';
import { CategoryRepository, TodoRepository } from '../repos';
import { LoggerService } from 'src/logs/logger.service';
import { ITodoService } from '../interfaces';
import { PaginationDto } from 'src/common/pagination/dto/requests/pagination.dto';

@Injectable()
export class TodoService implements ITodoService {
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

  async getAllTodos(userId: string, paginationDto: PaginationDto) {
    try {
      return await this.todoRepository.getAllTodos(userId, paginationDto);
    } catch (error) {
      this.logger.error('Failed to retrieve todos', error);
      throw error;
    }
  }

  async getTodoById(id: string, userId: string) {
    try {
      const todo = await this.todoRepository.findOneById(id, userId);
      return todo;
    } catch (error) {
      this.logger.error('Failed to retrieve todo by ID', error);
      throw error;
    }
  }

  async updateTodo(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    try {
      if (updateTodoDto.categoryId) {
        await this.validateCategoryOwnership(userId, updateTodoDto.categoryId);
      }

      await this.todoRepository.findAndUpdate(id, updateTodoDto, userId);
    } catch (error) {
      this.logger.error('Failed to update todo', error);
      throw error;
    }
  }

  async deleteTodo(id: string, userId: string) {
    try {
      await this.todoRepository.findAndDelete(id, userId);
    } catch (error) {
      this.logger.error('Failed to delete todo', error);
      throw error;
    }
  }

  async updateTodoStatus(
    id: string,
    updateTodoStatusDto: UpdateTodoStatusDto,
    userId: string,
  ) {
    try {
      await this.todoRepository.findAndUpdate(
        id,
        {
          status: updateTodoStatusDto.status,
        },
        userId,
      );
    } catch (error) {
      this.logger.error('Failed to update todo status', error);
      throw error;
    }
  }

  private async validateCategoryOwnership(userId: string, categoryId: string) {
    const category = await this.categoryRepository.findCategory(
      userId,
      categoryId,
    );
    if (!category) {
      throw new NotFoundException(
        'No category match provided id in your account',
      );
    }
  }
}
