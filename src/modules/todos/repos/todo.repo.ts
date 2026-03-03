import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ITodoRepository } from '../interfaces';
import { paginate } from 'src/common/pagination/paginate.helper';
import { PaginationDto } from 'src/common/pagination/dto/requests/pagination.dto';
import { PaginatedResponseDto } from 'src/common/pagination/dto';

@Injectable()
export class TodoRepository implements ITodoRepository {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  get repository(): Repository<Todo> {
    return this.todoRepository;
  }

  async createTodo(userId: string, todoData: Partial<Todo>): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...todoData,
      ownerId: userId,
    });
    return this.todoRepository.save(todo);
  }

  async getAllTodos(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Todo>> {
    // return this.todoRepository.find({
    //   where: { ownerId: userId },
    // });

    return paginate(this.todoRepository, { ownerId: userId }, paginationDto);
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
}
