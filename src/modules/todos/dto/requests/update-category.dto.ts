import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'The name of the category',
    example: 'Work',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  @ApiProperty({
    description: 'The color associated with the category',
    example: '#FF5733',
  })
  color?: string;
}
