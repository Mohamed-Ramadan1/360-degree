import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  GetAllTodosResponse,
  GetTodoResponse,
  TodoCreateDto,
  TodoCreateResponse,
} from '../dto';
import { TodoService } from '../services/todo.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { ITodo } from '../interfaces/entities/todo.interface';

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
  @HttpCode(HttpStatus.CREATED)
  async createTodo(@Body() createTodoDto: TodoCreateDto, @Req() req) {
    const todo = await this.todoService.createTodo(req.user.id, createTodoDto);
    return {
      message: 'Todo created successfully',
      todo,
    };
  }

  @ApiOperation({
    summary: 'Get all todos',
    description:
      'Retrieves a list of all todo items for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Todos retrieved successfully',
    type: GetAllTodosResponse,
    example: {
      message: 'Todos retrieved successfully',
      todos: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Buy groceries',
          description: 'Milk, Bread, Eggs',
          dueDate: '2024-12-31T23:59:59Z',
          priority: 'High',
          otherInfo: '...',
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Finish project report',
          description: 'Complete the final report for the project',
          dueDate: '2024-12-31T23:59:59Z',
          priority: 'Medium',
          otherInfo: '...',
        },
      ],
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTodos() {
    const todos = await this.todoService.getAllTodos();
    return {
      message: 'Todos retrieved successfully',
      todos,
    };
  }

  @ApiOperation({
    summary: 'Get a todo by ID',
    description: 'Retrieves a single todo item by its unique identifier.',
  })
  @ApiOkResponse({
    type: GetTodoResponse,
    description: 'Todo retrieved successfully',
    example: {
      message: 'Todo retrieved successfully',
      todo: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Buy groceries',
        description: 'Milk, Bread, Eggs',
        dueDate: '2024-12-31T23:59:59Z',
        priority: 'High',
        otherInfo: '...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid todo ID supplied',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the todo item',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTodoById(@Param('id', new ParseUUIDPipe()) id: string) {
    const todo: ITodo = await this.todoService.getTodoById(id);
    return {
      message: 'Todo retrieved successfully',
      todo,
    };
  }

  @Patch(':id')
  updateTodo() {}

  @Delete(':id')
  deleteTodo() {}

  @Patch(':id/status')
  updateTodoStatus() {}
}
