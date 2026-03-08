import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { IUser } from '../../interfaces';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetUsersResponseDto extends PaginatedResponseDto<IUser> {
  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Users retrieved successfully',
  })
  message: string;
}
