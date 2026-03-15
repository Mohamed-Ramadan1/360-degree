import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { GetCategoriesDto, UpdateCategoryDto } from '../dto';
import { ICategoryRepository } from '../interfaces';
import { generateId } from 'src/utils';
@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly paginationService: PaginationService,
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
      id: generateId(),
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

  async getAllCategories(userId: string, dto: GetCategoriesDto) {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('categories')
      .where('categories.ownerId = :userId', { userId });

    return this.paginationService.paginate(queryBuilder, dto, {
      alias: 'categories',
      filters: {
        name: { value: dto.name, operator: 'like' },
      },
    });
  }

  async findCategoryAndUpdate(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    const result = await this.categoryRepository.update(
      { id, ownerId: userId },
      updateCategoryDto,
    );
    if (result.affected === 0) {
      throw new NotFoundException('No category match provided id');
    }
  }

  async deleteCategory(userId: string, id: string) {
    const result = await this.categoryRepository.delete({
      id,
      ownerId: userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('No category match provided id');
    }
  }
}
