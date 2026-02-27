import { IUser } from '../../interfaces/entities/user.interface';
import { ApiProperty } from '@nestjs/swagger';
export class RetrievalUserResponseDto {
  @ApiProperty({
    example: 'User retrieved successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    description: 'Retrieved user details',
    example: {
      id: 'user123',
      email: 'user@example.com',
      name: 'John Doe',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      resetInfo: '...',
    },
  })
  user: Omit<IUser, 'password'>;
}
