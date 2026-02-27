import { IUser } from '../../interfaces/entities/user.interface';
import { ApiProperty } from '@nestjs/swagger';
export class RetrievalUsersResponseDto {
  @ApiProperty({
    example: 'Users retrieved successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    example: 'success',
    description: 'Response status',
  })
  status: string;

  @ApiProperty({
    description: 'Retrieved users details',
    example: [
      {
        id: 'user123',
        email: 'user@example.com',
        name: 'John Doe',
        roles: ['user'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        resetInfo: '...',
      },
    ],
  })
  users: Omit<IUser, 'password'>[];
}
