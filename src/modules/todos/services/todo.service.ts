import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoCreateDto, UpdateTodoDto } from '../dto';
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
    try {
      return await this.todoRepository.getAllTodos();
    } catch (error) {
      this.logger.error('Failed to retrieve todos', error);
      throw error;
    }
  }

  async getTodoById(id: string) {
    try {
      const todo = await this.todoRepository.findOneById(id);
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

      await this.todoRepository.findAndUpdate(id, updateTodoDto);
    } catch (error) {
      this.logger.error('Failed to update todo', error);
      throw error;
    }
  }

  async deleteTodo(id: string) {
    try {
      await this.todoRepository.findAndDelete(id);
    } catch (error) {
      this.logger.error('Failed to delete todo', error);
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
        'Category not found or does not belong to the user',
      );
    }
  }
}
