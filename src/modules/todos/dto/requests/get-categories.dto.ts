import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/pagination/dto';

export class GetCategoriesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by category name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
