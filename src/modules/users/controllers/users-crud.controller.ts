import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserRoles } from 'src/common/consts';
import { Roles } from 'src/common/decorators';
import { RolesGuard } from 'src/common/guards';
import { UsersCrudService } from '../services/users-crud.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { AdminCreateUserDto } from '../dto';
import { IUser } from '../interfaces/entities/user.interface';

@Roles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER)
@UseGuards(RolesGuard)
@UseInterceptors(TransformResponseInterceptor)
@Controller()
export class UsersCrudController {
  constructor(private readonly usersCrudService: UsersCrudService) {}

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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers() {
    const users = await this.usersCrudService.listUsers();
    return {
      message: 'Users retrieved successfully',
      status: 'success',
      users,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    const user: IUser = await this.usersCrudService.getUser(id);
    return { message: 'User retrieved successfully', user };
  }
}
