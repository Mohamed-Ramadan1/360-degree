import { User } from 'src/modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
export class SignUpResponseDto {
  @ApiProperty({
    description: 'Signed up user details without password',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
    },
  })
  user: Omit<User, 'password'>;

  @ApiProperty({
    description: 'Generated access token',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
  })
  tokenPair: {
    accessToken: string;
  };
}
