import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { TodoCreateDto, TodoCreateResponse } from '../dto';
import { TodoService } from '../services/todo.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';

@UseInterceptors(TransformResponseInterceptor)
@ApiBearerAuth('JWT-auth')
@Controller()
export class TodosController {
  constructor(private readonly todoService: TodoService) {}

  @ApiOperation({
    summary: 'Create a new todo',
    description:
      'Creates a new todo item for the authenticated user. Optionally, you can associate the todo with an existing category by providing the categoryId.',
  })
  @ApiOkResponse({
    type: TodoCreateResponse,
    description: 'The todo was created successfully',
    example: {
      message: 'Todo created successfully',
      todo: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Buy groceries',
        description: 'Milk, Bread, Eggs',
        dueDate: '2024-12-31T23:59:59Z',
        priority: 'High',
        status: 'Pending',
        isPersonal: true,
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['shopping', 'errands'],
        categoryId: null,
        createdAt: '2026-03-02T09:09:13.490Z',
        updatedAt: '2026-03-02T09:09:13.490Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiBody({
    type: TodoCreateDto,
    description: 'The data required to create a new todo',
    examples: {
      valid: {
        summary: 'Valid request',
        value: {
          title: 'Buy groceries',
          description: 'Milk, Bread, Eggs',
          dueDate: '2024-12-31T23:59:59Z',
          priority: 'High',
        },
      },
      invalid: {
        summary: 'Invalid request - missing title',
        value: {
          description: 'Milk, Bread, Eggs',
          dueDate: '2024-12-31T23:59:59Z',
          priority: 'High',
        },
      },
    },
  })
  @Post()
  async createTodo(@Body() createTodoDto: TodoCreateDto, @Req() req) {
    const todo = await this.todoService.createTodo(req.user.id, createTodoDto);
    return {
      message: 'Todo created successfully',
      todo,
    };
  }

  @Get()
  getAllTodos() {}

  @Get(':id')
  getTodoById() {}

  @Patch(':id')
  updateTodo() {}

  @Delete(':id')
  deleteTodo() {}

  @Patch(':id/status')
  updateTodoStatus() {}
}
