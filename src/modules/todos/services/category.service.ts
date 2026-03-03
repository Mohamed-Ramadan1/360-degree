import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repos';
import { CreateCategoryDto } from '../dto';
import { LoggerService } from 'src/logs/logger.service';

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
}
