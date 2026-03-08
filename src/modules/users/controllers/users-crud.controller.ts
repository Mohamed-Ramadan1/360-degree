import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserRoles } from 'src/common/consts';
import { Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import { UsersCrudService } from '../services/users-crud.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import {
  AdminCreateUserDto,
  AdminCreateUserResponseDto,
  GetUsersDto,
  GetUsersResponseDto,
  RetrievalUserResponseDto,
  RetrievalUsersResponseDto,
} from '../dto';
import { IUser } from '../interfaces/entities/user.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER)
@UseGuards(RolesGuard)
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('Users CRUD Management')
@ApiBearerAuth('JWT-auth')
@Controller()
export class UsersCrudController {
  constructor(private readonly usersCrudService: UsersCrudService) {}

  @ApiOperation({
    summary: 'Create User',
    description: 'Creates a new user in the system.',
  })
  @ApiOkResponse({
    description: 'User created successfully',
    type: AdminCreateUserResponseDto,
    example: {
      message: 'User created successfully',
      status: 'success',
      user: {
        id: 'user-id',
        email: 'user@example.com',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or user already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiBody({
    type: AdminCreateUserDto,
    description: 'Payload to create a new user',
    examples: {
      example1: {
        summary: 'Create User Example',
        value: {
          email: 'user@example.com',

          password: 'SecurePassword123!',
          name: 'User Name',
          roles: ['user'],
        },
      },
      example2: {
        summary: 'Invalid User Example',
        value: {
          email: 'invalid-email',
          password: '123',
          name: '',
          roles: ['invalid-role'],
        },
      },
      example3: {
        summary: 'User Already Exists Example',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!',
          name: 'User Name',
          roles: ['user'],
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() userData: AdminCreateUserDto) {
    const user = await this.usersCrudService.createUser(userData);
    return {
      message: 'User created successfully',
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieves a list of all users in the system.',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: GetUsersResponseDto,
    example: {
      message: 'Users retrieved successfully',
      data: [
        {
          id: 'user-id-1',
          email: 'user1@example.com',
          name: 'User One',
          roles: ['admin'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          otherInfo: '...',
        },
        {
          id: 'user-id-2',
          email: 'user2@example.com',
          name: 'User Two',
          roles: ['user'],
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          otherInfo: '...',
        },
      ],
      meta: {
        hasNextPage: false,
        nextCursor: null,
        limit: 20,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiQuery({
    name: 'GetUsersDto',
    description:
      'The query parameters for retrieving users. This includes pagination and filtering parameters.',
    type: GetUsersDto,
    examples: {
      valid: {
        summary: 'Valid query with pagination and filters',
        value: {
          limit: 20,
          name: 'John',
          email: 'test@example.com',
        },
      },
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query() getUsersDto: GetUsersDto,
  ): Promise<GetUsersResponseDto> {
    const result = await this.usersCrudService.listUsers(getUsersDto);
    return {
      message: 'Users retrieved successfully',
      ...result,
    };
  }

  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Retrieves a user by their unique ID.',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: RetrievalUserResponseDto,
    example: {
      message: 'User retrieved successfully',
      user: {
        id: 'user-id',
        email: 'user@example.com',
        name: 'User Name',
        roles: ['admin'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        otherInfo: '...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID supplied',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    type: String,
    example: '1e5f9f22-a0d2-4c5e-9b02-ae56297cf45b',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    const user: IUser = await this.usersCrudService.getUser(id);
    return { message: 'User retrieved successfully', user };
  }
}
