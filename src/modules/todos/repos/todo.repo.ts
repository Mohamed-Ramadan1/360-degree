import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ITodoRepository } from '../interfaces';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { GetTodosDto } from '../dto';
import { generateId } from 'src/utils';

@Injectable()
export class TodoRepository implements ITodoRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly paginationService: PaginationService,
  ) {}

  get repository(): Repository<Todo> {
    return this.todoRepository;
  }

  async createTodo(userId: string, todoData: Partial<Todo>): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...todoData,
      id: generateId(),
      ownerId: userId,
    });
    return this.todoRepository.save(todo);
  }

  async getAllTodos(
    userId: string,
    getTodosDto: GetTodosDto,
  ): Promise<PaginatedResponseDto<Todo>> {
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todos')
      .where('todos.ownerId = :userId', { userId });

    return this.paginationService.paginate(queryBuilder, getTodosDto, {
      alias: 'todos',
      filters: {
        status: { value: getTodosDto.status },
        priority: { value: getTodosDto.priority },
        isPersonal: { value: getTodosDto.isPersonal },
      },
    });
  }

  async findOneById(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id, ownerId: userId },
      select: [
        'id',
        'title',
        'description',
        'dueDate',
        'priority',
        'status',
        'isPersonal',
        'ownerId',
        'tags',
        'categoryId',
      ],
    });
    if (!todo) throw new NotFoundException('No todo match provided id');
    return todo;
  }

  async findAndUpdate(id: string, updateData: Partial<Todo>, userId: string) {
    const result = await this.todoRepository.update(
      { id, ownerId: userId },
      updateData,
    );
    if (result.affected === 0) {
      throw new NotFoundException('No todo match provided id');
    }
  }

  async findAndDelete(id: string, userId: string) {
    const result = await this.todoRepository.delete({ id, ownerId: userId });
    if (result.affected === 0) {
      throw new NotFoundException('No todo match provided id');
    }
  }

  async findTodoWithReminders(todoId: string, userId: string) {
    return this.todoRepository.findOne({
      where: { id: todoId, ownerId: userId },
      relations: ['reminders'],
      select: {
        id: true,
        reminders: {
          id: true,
          reminderAt: true,
        },
      },
    });
  }
}
