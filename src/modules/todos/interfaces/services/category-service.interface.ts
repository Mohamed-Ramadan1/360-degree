import { Category } from '../../entities/category.entity';
import { GetCategoriesDto } from '../../dto';
import { GetAllCategoriesResponse } from '../../dto/response/get-categories.response';

export interface ICategoryService {
  create(
    userId: string,
    createCategoryDto: Partial<Category>,
  ): Promise<Category>;
  getAllCategories(userId: string, getCategoriesDto: GetCategoriesDto);
  updateCategory(
    userId: string,
    id: string,
    updateCategoryDto: Partial<Category>,
  ): Promise<void>;
  deleteCategory(userId: string, id: string): Promise<void>;
}
