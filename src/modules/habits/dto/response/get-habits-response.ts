import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { IHabit } from '../../interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class GetHabitsResponse extends PaginatedResponseDto<IHabit> {
  @ApiProperty({
    description: 'A message indicating the result of the habits retrieval',
    example: 'Habits retrieved successfully',
    required: true,
  })
  message!: string;
}
