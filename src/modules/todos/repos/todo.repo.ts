import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from '../entities/todo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TodoRepository {
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

  async getAllTodos() {
    return this.todoRepository.find();
  }

  async findOneById(id: string) {
    const todo = await this.todoRepository.findOne({
      where: { id },
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

  async findAndUpdate(id: string, updateData: Partial<Todo>) {
    const result = await this.todoRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException('No todo match provided id');
    }
  }

  async findAndDelete(id: string) {
    const result = await this.todoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('No todo match provided id');
    }
  }
}
