import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { ICategory } from '../../interfaces';

export class GetAllCategoriesResponse extends PaginatedResponseDto<ICategory> {
  @ApiProperty({
    description: 'A message indicating the result of the operation',
    example: 'Categories retrieved successfully',
    required: true,
  })
  message: string;
}
