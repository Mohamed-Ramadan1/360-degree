import { ApiProperty } from '@nestjs/swagger';

export class BulkRolesRemoveResponseDto {
  @ApiProperty({
    description: 'Operation message',
    example: 'Roles removed successfully',
  })
  message: string;
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;
  @ApiProperty({
    description: 'Number of roles updated',
    example: 5,
  })
  updated: number;
  @ApiProperty({
    description: 'Number of roles not found',
    example: 2,
  })
  notFound: string[];
}
