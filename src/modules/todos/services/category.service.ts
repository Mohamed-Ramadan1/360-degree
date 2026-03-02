import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repos';
import { CreateCategoryDto } from '../dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    return await this.categoryRepository.createCategory(
      userId,
      createCategoryDto,
    );
  }
}
