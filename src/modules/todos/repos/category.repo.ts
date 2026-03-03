import { Injectable } from '@nestjs/common';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/pagination/dto';
import { paginate } from 'src/common/pagination/paginate.helper';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  get repository(): Repository<Category> {
    return this.categoryRepository;
  }

  async createCategory(
    userId: string,
    createCategoryDto: Partial<Category>,
  ): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      ownerId: userId,
    });
    return await this.categoryRepository.save(category);
  }

  async findCategory(
    userId: string,
    categoryId: string,
  ): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { id: categoryId, ownerId: userId },
    });
  }

  async getAllCategories(userId: string, paginationDto: PaginationDto) {
    return paginate(
      this.categoryRepository,
      {
        ownerId: userId,
      },
      paginationDto,
    );
  }
}
