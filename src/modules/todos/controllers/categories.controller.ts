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
import { CategoriesService } from '../services/category.service';
import { CreateCategoryDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { CategoryCreateResponse } from '../dto/response/category-create-response';

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
          description: 'Tasks related to work and professional life',
        },
      },
      invalid: {
        summary: 'Invalid category creation request',
        value: {
          name: '',
          description: '',
        },
      },
    },
  })
  @Post()
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

  @Get()
  getAllCategories() {}

  @Patch(':id')
  updateCategory() {}

  @Delete(':id')
  deleteCategory() {}
}
