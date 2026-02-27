import { IUser } from '../../interfaces/entities/user.interface';
import { ApiProperty } from '@nestjs/swagger';
export class AdminCreateUserResponseDto {
  @ApiProperty({
    example: 'User created successfully',
    description: 'Response message',
  })
  message: 'User created successfully';
  @ApiProperty({
    example: 'success',
    description: 'Response status',
  })
  status: 'success';

  @ApiProperty({
    description: 'Created user details',
    example: {
      id: 'user123',
      email: 'user@example.com',
      name: 'John Doe',
      roles: ['user'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  user: Pick<
    IUser,
    'id' | 'email' | 'name' | 'roles' | 'createdAt' | 'updatedAt'
  >;
}
