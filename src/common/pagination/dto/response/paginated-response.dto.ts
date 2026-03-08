import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    description: 'Indicates if there are more items to fetch',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'The cursor for the next page of results',
    nullable: true,
    example: 'next_cursor_value',
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'The maximum number of items to return',
    example: 10,
  })
  limit: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'The array of items for the current page',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    type: PaginationMeta,
    description: 'Pagination metadata',
    example: {
      hasNextPage: true,
      nextCursor: 'next_cursor_value',
      limit: 10,
    },
  })
  meta: PaginationMeta;
}
