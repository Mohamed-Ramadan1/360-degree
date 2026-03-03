import { PaginationDto } from 'src/common/pagination/dto';
import { Category } from '../../entities/category.entity';

export interface ICategoryService {
  create(
    userId: string,
    createCategoryDto: Partial<Category>,
  ): Promise<Category>;
  getAllCategories(userId: string, paginationDto: PaginationDto);
  updateCategory(
    userId: string,
    id: string,
    updateCategoryDto: Partial<Category>,
  ): Promise<void>;
  deleteCategory(userId: string, id: string): Promise<void>;
}
