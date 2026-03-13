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
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from '../services/category.service';
import { CreateCategoryDto, GetCategoriesDto, UpdateCategoryDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { CategoryCreateResponse } from '../dto/response/category-create-response';
import { OperationSuccessDto } from 'src/modules/auth/dtos';
import { GetAllCategoriesResponse } from '../dto/response/get-categories.response';
import { Throttle } from '@nestjs/throttler';

@UseInterceptors(TransformResponseInterceptor)
@Throttle({ default: { limit: 25, ttl: 600000 } })
@ApiTags('Categories')
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
    type: GetAllCategoriesResponse,
    example: {
      message: 'Categories retrieved successfully',
      data: [
        {
          id: 1,
          name: 'Work',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
      meta: {
        hasNextPage: false,
        nextCursor: null,
        limit: 50,
      },
    },
  })
  @ApiQuery({
    name: 'GetCategoriesDto',
    description:
      'The query parameters for retrieving categories. This includes pagination parameters.',
    type: GetCategoriesDto,
    examples: {
      valid: {
        summary: 'Valid query with pagination',
        value: {
          limit: 50,
          name: 'Work',
        },
      },
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCategories(
    @Query() getCategoriesDto: GetCategoriesDto,
    @Req() req,
  ) {
    const result = await this.categoryService.getAllCategories(
      req.user.id,
      getCategoriesDto,
    );
    return {
      message: 'Categories retrieved successfully',
      ...result,
    };
  }

  @ApiOperation({
    summary: 'Update a category',
    description:
      'Updates an existing category for the authenticated user. The category can be updated with a new name and color.',
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: OperationSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or category ID',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'The data required to update an existing category',
    examples: {
      valid: {
        summary: 'Valid category update request',
        value: {
          name: 'Updated Category Name',
          color: '#FF5733',
        },
      },
      invalid: {
        summary: 'Invalid category update request',
        value: {
          name: '',
        },
      },
    },
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req,
  ) {
    await this.categoryService.updateCategory(
      req.user.id,
      id,
      updateCategoryDto,
    );
    return {
      message: 'Category updated successfully',
    };
  }

  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Deletes an existing category for the authenticated user. This action is irreversible and will remove the category and all associated tasks.',
  })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    type: OperationSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Delete(':id')
  async deleteCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req,
  ): Promise<OperationSuccessDto> {
    await this.categoryService.deleteCategory(req.user.id, id);
    return {
      message: 'Category deleted successfully',
    };
  }
}
