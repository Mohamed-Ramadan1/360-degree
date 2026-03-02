import { ApiProperty } from '@nestjs/swagger';
import { ICategory } from '../../interfaces/entities/category.interface';

export class CategoryCreateResponse {
  @ApiProperty({
    description: 'A message indicating the result of the category creation',
    example: 'Category created successfully',
    required: true,
  })
  message: string;

  category: Pick<
    ICategory,
    'id' | 'color' | 'description' | 'name' | 'createdAt' | 'updatedAt'
  >;
}
