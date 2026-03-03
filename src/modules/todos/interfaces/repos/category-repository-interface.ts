import { PaginationDto } from 'src/common/pagination/dto';
import { Category } from '../../entities/category.entity';

export interface ICategoryRepository {
  createCategory(
    userId: string,
    createCategoryDto: Partial<Category>,
  ): Promise<Category>;
  findCategory(userId: string, categoryId: string): Promise<Category | null>;
  getAllCategories(userId: string, paginationDto: PaginationDto);
  findCategoryAndUpdate(
    userId: string,
    id: string,
    updateCategoryDto: Partial<Category>,
  ): Promise<void>;
  deleteCategory(userId: string, id: string): Promise<void>;
}
