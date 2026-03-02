import { Injectable } from '@nestjs/common';
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
}
