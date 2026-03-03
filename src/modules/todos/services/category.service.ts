import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repos';
import { CreateCategoryDto } from '../dto';
import { LoggerService } from 'src/logs/logger.service';
import { PaginationDto } from 'src/common/pagination/dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoryRepository.createCategory(
        userId,
        createCategoryDto,
      );
    } catch (error) {
      this.loggerService.error('Failed to create category', error);
      throw error;
    }
  }

  async getAllCategories(userId: string, paginationDto: PaginationDto) {
    try {
      return await this.categoryRepository.getAllCategories(
        userId,
        paginationDto,
      );
    } catch (error) {
      this.loggerService.error('Failed to get all categories', error);
      throw error;
    }
  }
}
