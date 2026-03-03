import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from '../services/category.service';
import { CreateCategoryDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { CategoryCreateResponse } from '../dto/response/category-create-response';
import { PaginationDto } from 'src/common/pagination/dto/requests/pagination.dto';

@UseInterceptors(TransformResponseInterceptor)
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category for the authenticated user. The category can be used to organize todos into different groups.',
  })
  @ApiOkResponse({
    type: CategoryCreateResponse,
    description: 'The category was created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'The data required to create a new category',
    examples: {
      valid: {
        summary: 'Valid category creation request',
        value: {
          name: 'Work',
        },
      },
      invalid: {
        summary: 'Invalid category creation request',
        value: {
          name: '',
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req,
  ) {
    const category = await this.categoryService.create(
      req.user.id,
      createCategoryDto,
    );
    return {
      message: 'Category created successfully',
      category,
    };
  }

  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieves a paginated list of all categories for the authenticated user. This allows users to see all their categories and manage them effectively.',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid pagination parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    example: {
      message: 'Categories retrieved successfully',
      categories: [
        {
          id: 1,
          name: 'Work',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 15,
        totalPages: 1,
      },
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCategories(@Query() paginationDto: PaginationDto, @Req() req) {
    const result = await this.categoryService.getAllCategories(
      req.user.id,
      paginationDto,
    );
    return {
      message: 'Categories retrieved successfully',
      ...result,
    };
  }

  @Patch(':id')
  updateCategory() {}

  @Delete(':id')
  deleteCategory() {}
}
